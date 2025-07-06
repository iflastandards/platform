const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function getTextOrEmpty(element, strip = true) {
    if (!element || !element.text) return "";
    const text = element.text();
    return strip ? text.trim() : text;
}

function getDecodeContentsOrEmpty(element) {
    if (!element || !element.html) return "";
    return (element.html() || "").trim();
}

function formatRdfSubElements(elementDiv, baseUrlPrefix, $) {
    const subElements = [];
    if (!elementDiv || !elementDiv.length) return [];

    let links = elementDiv.find('a.linkMenuElement');
    if (links.length === 0 && elementDiv.find('div.navISBDMRef').length > 0) {
        links = elementDiv.find('div.navISBDMRef').find('a.linkMenuElement');
    }

    links.each((i, aTag) => {
        const $aTag = $(aTag);
        const label = getTextOrEmpty($aTag);
        const hrefAttr = $aTag.attr('href');
        if (!hrefAttr) return;

        const url = hrefAttr.replace(baseUrlPrefix, "/docs").replace(".html", "");
        const uriBase = "http://iflastandards.info/ns/isbdm/elements/";
        const elementIdFromUrl = url.substring(url.lastIndexOf('/') + 1);
        const uriPrefix = /^\d+$/.test(elementIdFromUrl) ? "P" : "C"; // Basic check for Property/Class
        const uri = `${uriBase}${uriPrefix}${elementIdFromUrl}`;
        subElements.push({ uri, url, label });
    });
    return subElements.length > 0 ? subElements : [];
}


function processNodeForContent(node, $, mdxParts) {
    const $node = $(node);

    if (node.type === 'text') {
        const strippedString = $node.text().trim();
        if (strippedString) {
            mdxParts.push(strippedString);
        }
        return;
    }

    if (node.type !== 'tag') return;

    if (node.name === 'h4') {
        mdxParts.push(`## ${getTextOrEmpty($node)}`);
        mdxParts.push("");
    } else if ($node.hasClass('guid')) {
        const pTag = $node.find('p').first(); // Prefer content from <p> tag if present
        const contentSourceElement = pTag.length ? pTag : $node; // Fallback to the div itself

        // Get the inner HTML content initially
        let processedContent = getDecodeContentsOrEmpty(contentSourceElement, $);

        // Perform existing transformations (e.g., quotes, bold spans to Markdown)
        processedContent = processedContent.replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”');
        processedContent = processedContent.replace(/<span class="bolded">(.*?)<\/span>/gs, '**$1**');
        processedContent = processedContent.replace(/<span class="bolder">(.*?)<\/span>/gs, '**$1**');

        // --- New Whitespace Normalization Step ---
        // Replace any sequence of whitespace characters (including newlines, tabs) with a single space.
        // Then, trim leading/trailing whitespace from the result.
        processedContent = processedContent.replace(/\s+/g, ' ').trim();
        // --- End of New Whitespace Normalization Step ---

        mdxParts.push(`<div className="guid">${processedContent}</div>`);
        mdxParts.push("");
    } else if ($node.hasClass('seeAlsoAdd')) {
        const link = $node.find('a.linkMenuElement').first();
        if (link.length) {
            const text = getTextOrEmpty(link);
            const href = (link.attr('href') || "").replace('/ISBDM', '').replace('.html', '');
            mdxParts.push(`<SeeAlso>[${text}](${href})</SeeAlso>`);
            mdxParts.push("");
        }
    } else if (node.name === 'hr') {
        mdxParts.push("---");
        mdxParts.push("");
    } else if ($node.hasClass('stip')) {
        const mdxStipParts = [];
        if ($node.find('div.mandatory').length > 0) {
            mdxStipParts.push("<Mandatory />");
            mdxStipParts.push("");
        }

        $node.contents().each((i, childNode) => {
            const $childNode = $(childNode);
            if (childNode.type === 'text') {
                const strippedChildString = $childNode.text().trim();
                if (strippedChildString) {
                    mdxStipParts.push(strippedChildString);
                }
            } else if (childNode.type === 'tag') {
                if (childNode.name === 'p') {
                    let pContent = "";
                    $childNode.contents().each((j, item) => {
                        const $item = $(item);
                        if (item.type === 'text') {
                            pContent += $item.text();
                        } else if (item.type === 'tag') {
                            if (item.name === 'a' && $item.hasClass('linkInline')) {
                                const linkText = getTextOrEmpty($item);
                                const linkHref = ($item.attr('href') || "").replace('/ISBDM', '').replace('.html', '');
                                pContent += `<InLink href="${linkHref}">${linkText}</InLink>`;
                            } else if (item.name === 'span' && ($item.hasClass('bolded') || $item.hasClass('bolder'))) {
                                pContent += `**${getTextOrEmpty($item)}**`;
                            } else {
                                pContent += $.html($item); // Keep other HTML like <i>
                            }
                        }
                    });
                    mdxStipParts.push(pContent.trim());
                } else if (childNode.name === 'ol' && $childNode.hasClass('num')) {
                    $childNode.find('li').each((k, li) => {
                        mdxStipParts.push(`  ${k + 1}. ${getTextOrEmpty($(li))}`);
                    });
                } else if (childNode.name === 'ul' && $childNode.hasClass('bull')) {
                    $childNode.find('li').each((k, li) => {
                        mdxStipParts.push(`  - ${getTextOrEmpty($(li))}`);
                    });
                } else if ($childNode.hasClass('xampleBlockStip')) {
                    mdxStipParts.push("");
                    mdxStipParts.push("<details>");
                    mdxStipParts.push("  <summary>Examples</summary>");
                    mdxStipParts.push("  ");

                    const examplesDiv = $childNode.find('div.xamples').first();
                    if (examplesDiv.length) {
                        const exampleContentAccumulator = [];
                        let currentGroupHadTable = false;

                        // Process direct children of examplesDiv which are expected to be wrappers or hr
                        examplesDiv.children().each((exIdx, exWrapperOrHr) => {
                            const $exWrapperOrHr = $(exWrapperOrHr);

                            if (exWrapperOrHr.name === 'hr') {
                                exampleContentAccumulator.push("    <hr />");
                                exampleContentAccumulator.push("    ");
                                currentGroupHadTable = false; // Reset for next potential group
                                return; // continue to next child
                            }

                            // Assuming other children are div wrappers for example content
                            const tableHeader = "    | Property | Value |\n    |:---------|:------|";
                            const tableRows = [];
                            const comments = [];

                            $exWrapperOrHr.find('div.row.px-2').each((ridx, exSubItem) => {
                                const $exSubItem = $(exSubItem);
                                const labelCol = $exSubItem.find('.xampleLabel');
                                const valueCol = $exSubItem.find('.xampleValue');
                                const editCommentCol = $exSubItem.find('.editComment');

                                if (labelCol.length && valueCol.length) {
                                    const prop = getTextOrEmpty(labelCol);
                                    const val = getTextOrEmpty(valueCol);
                                    tableRows.push(`    | ${prop} | ${val} |`);
                                } else if (editCommentCol.length) {
                                    let commentText = "";
                                    editCommentCol.contents().each((cidx, itemC) => {
                                        const $itemC = $(itemC);
                                        if (itemC.type === 'text') {
                                            commentText += $itemC.text().trim();
                                        } else if (itemC.type === 'tag' && itemC.name === 'a' && $itemC.hasClass('linkInline')) {
                                            const linkTextC = getTextOrEmpty($itemC);
                                            const linkHrefC = ($itemC.attr('href') || "").replace('/ISBDM', '').replace('.html', '');
                                            commentText += `<InLink href="${linkHrefC}">${linkTextC}</InLink>`;
                                        } else {
                                            commentText += $.html($itemC); // Keep other HTML as is
                                        }
                                    });
                                    commentText = commentText.trim().replace(/^\[\s*(.*?)\s*\]$/, '*$1*');
                                    comments.push(`    ${commentText}`);
                                }
                            });

                            if (tableRows.length > 0) {
                                if (!currentGroupHadTable) { // Add header only for the first table in a group or if new group
                                    exampleContentAccumulator.push(tableHeader);
                                }
                                exampleContentAccumulator.push(...tableRows);
                                currentGroupHadTable = true;
                            }
                            if (comments.length > 0) {
                                if(tableRows.length > 0) exampleContentAccumulator.push("    "); // spacing after table before comments
                                exampleContentAccumulator.push(...comments);
                            }
                            if (tableRows.length > 0 || comments.length > 0) {
                                exampleContentAccumulator.push("    "); // Spacing after each example item/group inside details
                            }
                        });
                        mdxStipParts.push(...exampleContentAccumulator);
                    }
                    mdxStipParts.push("</details>");
                    mdxStipParts.push("");
                }
            }
        });
        const finalStipBody = mdxStipParts.filter(p => p.trim() || p === "").join("\n  ").trimEnd();
        mdxParts.push(`<div className="stip">\n  ${finalStipBody}\n</div>`);
        mdxParts.push("");
    }
}


function convertHtmlToMdx(htmlContent, htmlFilename) {
    const $ = cheerio.load(htmlContent);
    const mdxParts = [];

    const targetHrefInHtml = `/ISBDM/docs/statements/${htmlFilename}`;
    const sidebarNav = $('nav.navISBDMSection');
    let calculatedSidebarPosition = 1; // Default
    let calculatedSidebarLevel = 1;    // Default (count of arrows + 1)

    if (sidebarNav.length) {
        const sidebarItems = sidebarNav.children('div.d-flex');
        sidebarItems.each((idx, itemRow) => {
            const $itemRow = $(itemRow);
            const linkTag = $itemRow.find('a[href]');
            if (linkTag.length && linkTag.attr('href') === targetHrefInHtml) {
                calculatedSidebarPosition = idx + 1;
                const arrowIconsCount = $itemRow.find('i.bi-arrow-return-right').length;
                calculatedSidebarLevel = arrowIconsCount + 1;
                return false; // Break .each loop
            }
        });
    } else {
        console.warn(`Warning: Could not find sidebar nav for ${htmlFilename}. Using defaults.`);
    }
    if (calculatedSidebarPosition === 0) {
        console.warn(`Warning: Could not determine sidebar_position for ${htmlFilename}. Using default 1.`);
        calculatedSidebarPosition = 1;
    }


    const fileIdMatch = htmlFilename.match(/(\d+)\.html$/);
    const elementIdStr = fileIdMatch ? fileIdMatch[1] : "UNKNOWN";

    const mainH3TitleTag = $('div.col-md-7').find('h3').first();
    const mainH3Title = getTextOrEmpty(mainH3TitleTag);

    const frontmatter = {
        id: elementIdStr,
        title: mainH3Title,
        sidebar_position: calculatedSidebarPosition,
        sidebar_level: calculatedSidebarLevel,
        aliases: [`/elements/P${elementIdStr}`],
        RDF: {
            id: elementIdStr,
            definition: "",
            domain: "",
            range: "",
            type: "DatatypeProperty",
            scopeNote: "",
            elementSubType: [],
            elementSuperType: null,
            equivalentProperty: [],
            inverseOf: []
        },
        deprecated_prospective: "true",
        deprecatedInVersion_prospective: "1.2.0",
        willBeRemovedInVersion_prospective: "2.0.0"
    };

    const elementRefSection = $('h4:contains("Element reference")').first();
    if (elementRefSection.length) {
        const elRefContainer = elementRefSection.next('div.px-4');
        if (elRefContainer.length) {
            elRefContainer.children('div.row').each((i, row) => {
                const $row = $(row);
                const refLabelDiv = $row.find('div.elref').first();
                const textDiv = $row.find('div.eltext').first();
                if (refLabelDiv.length && textDiv.length) {
                    const labelText = getTextOrEmpty(refLabelDiv).toLowerCase().replace(/\s|-/g, "");
                    switch (labelText) {
                        case 'definition':
                            frontmatter.RDF.definition = getTextOrEmpty(textDiv);
                            break;
                        case 'scopenote':
                            frontmatter.RDF.scopeNote = getTextOrEmpty(textDiv);
                            break;
                        case 'domain':
                            frontmatter.RDF.domain = getTextOrEmpty(textDiv);
                            break;
                        case 'range':
                            frontmatter.RDF.range = getTextOrEmpty(textDiv);
                            break;
                        case 'elementsubtype':
                            frontmatter.RDF.elementSubType = formatRdfSubElements(textDiv, "/ISBDM", $);
                            break;
                        case 'elementsupertype':
                            const superTypeLinks = formatRdfSubElements(textDiv, "/ISBDM", $);
                            frontmatter.RDF.elementSuperType = superTypeLinks.length > 0 ? superTypeLinks[0] : null;
                            break;
                    }
                }
            });
        }
    }

    mdxParts.push("---");
    mdxParts.push("# Docusaurus-specific fields");
    mdxParts.push(`id: ${frontmatter.id}`);
    mdxParts.push(`title: ${frontmatter.title}`);
    mdxParts.push(`sidebar_position: ${frontmatter.sidebar_position}  # determines the position in the sidebar and the section TOC`);
    mdxParts.push(`sidebar_level: ${frontmatter.sidebar_level}  # the level of subproperty relative to the base property. Used in building the section TOC`);
    mdxParts.push("aliases:");
    frontmatter.aliases.forEach(alias => {
        mdxParts.push(`  - ${alias} # this will be used to redirect the URI by the client side redirect`);
    });
    mdxParts.push("\n# Docusaurus defaults (can be overridden)");
    mdxParts.push("# slug: defaults to the file path");
    mdxParts.push("# sidebar_label: will default to the First header in the file, but can be overridden here");
    mdxParts.push("\n# Core element metadata");
    mdxParts.push("RDF:");
    mdxParts.push("  # Required properties");
    mdxParts.push(`  id: ${frontmatter.RDF.id}`);
    mdxParts.push("  # uri: will be assembled by concatenating the element_vocabulary_uri, 'P' for properties, 'C' for classes, and the id");
    mdxParts.push("  # label: will default to the First header in the file, but can be overridden here");
    mdxParts.push(`  definition: ${frontmatter.RDF.definition}`);
    mdxParts.push(`  domain: ${frontmatter.RDF.domain}`);
    mdxParts.push(`  range: ${frontmatter.RDF.range}`);
    mdxParts.push(`  type: ${frontmatter.RDF.type}`);
    mdxParts.push("  # Optional properties");
    mdxParts.push(`  scopeNote: "${frontmatter.RDF.scopeNote}"`);
    mdxParts.push("  \n  # Relationships with other elements (optional)");
    mdxParts.push("  elementSubType:  # has no RDF equivalent. Used in the table");
    if (frontmatter.RDF.elementSubType && frontmatter.RDF.elementSubType.length > 0) {
        frontmatter.RDF.elementSubType.forEach(subType => {
            mdxParts.push(`    - uri: ${subType.uri}`);
            mdxParts.push(`      url: ${subType.url}`);
            mdxParts.push(`      label: ${subType.label}`);
        });
    } else {
        mdxParts.push("    []");
    }
    mdxParts.push(`  elementSuperType: # will convert to subPropertyOf in RDF`);
    if (frontmatter.RDF.elementSuperType) {
        mdxParts.push(`    uri: ${frontmatter.RDF.elementSuperType.uri}`);
        mdxParts.push(`    url: ${frontmatter.RDF.elementSuperType.url}`);
        mdxParts.push(`    label: ${frontmatter.RDF.elementSuperType.label}`);
    } else {
        mdxParts.push("  ");
    }
    mdxParts.push("  equivalentProperty: []");
    mdxParts.push("  inverseOf: []");
    mdxParts.push("\n# Status and provenance");
    mdxParts.push("#  status: \"Published\" will be maintained at the global vocabulary level");
    mdxParts.push("#  isDefinedBy: will be maintained at the global vocabulary level");
    mdxParts.push("  \n# Deprecation information (if applicable - all optional)");
    mdxParts.push(`deprecated: "" # Prospective value: ${frontmatter.deprecated_prospective}`);
    mdxParts.push(`deprecatedInVersion: "" # Prospective value: "${frontmatter.deprecatedInVersion_prospective}"`);
    mdxParts.push(`willBeRemovedInVersion: "" # Prospective value: "${frontmatter.willBeRemovedInVersion_prospective}"`);
    mdxParts.push("---");
    mdxParts.push("");

    // --- Main Content ---
    const contentContainer = $('div.col-md-7').first();
    if (contentContainer.length) {
        if (mainH3TitleTag.length) {
            mdxParts.push(`# ${mainH3Title}`);
            mdxParts.push("");
        }

        mdxParts.push("## Element Reference");
        mdxParts.push("<ElementReference frontMatter={frontMatter} />");
        mdxParts.push("");

        let startProcessingAfter = elementRefSection.length ? elementRefSection.next('div.px-4') : mainH3TitleTag;
        if (!startProcessingAfter.length && mainH3TitleTag.length) { // Fallback if elementRefSection or its specific next sibling isn't found
            startProcessingAfter = mainH3TitleTag;
        }


        if(startProcessingAfter.length) {
            let currentNode = startProcessingAfter.next();
            while(currentNode.length) {
                processNodeForContent(currentNode.get(0), $, mdxParts);
                currentNode = currentNode.next();
            }
        } else {
            console.warn(`Could not find starting point for main content processing in ${htmlFilename}`);
            // Fallback: process all direct children of contentContainer after h3
            if (mainH3TitleTag.length) {
                mainH3TitleTag.nextAll().each((i, el) => processNodeForContent(el, $, mdxParts));
            } else {
                contentContainer.children().each((i, el) => processNodeForContent(el, $, mdxParts));
            }
        }

    }

    // Clean up excessive newlines at the end
    while (mdxParts.length > 0 && mdxParts[mdxParts.length - 1] === "") {
        mdxParts.pop();
    }
    return mdxParts.join("\n") + "\n"; // Ensure single trailing newline
}


// --- Main execution ---
if (require.main === module) {
    const htmlFilePath = process.argv[2] || '1025.html';
    const expectedMdxFilePath = process.argv[3] || '1025.expected.md'; // For diff command
    const mdxFilePath = htmlFilePath.replace(/\.html$/, '.generated.mdx');

    if (!fs.existsSync(htmlFilePath)) {
        console.error(`Error: HTML file not found at ${htmlFilePath}`);
        process.exit(1);
    }

    const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
    const mdxOutput = convertHtmlToMdx(htmlContent, path.basename(htmlFilePath));
    fs.writeFileSync(mdxFilePath, mdxOutput, 'utf-8');

    console.log(`Conversion complete. MDX file saved to: ${mdxFilePath}`);
    console.log(`\nTo test the output, run the following command in your terminal:`);
    console.log(`diff -u "${mdxFilePath}" "${expectedMdxFilePath}"`);
    console.log("(If there's no output from diff, the files are identical. Otherwise, differences will be shown.)");
}