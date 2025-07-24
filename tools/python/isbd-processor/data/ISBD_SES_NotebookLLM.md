Here is a comprehensive breakdown of each "Syntax Encoding Scheme" (SES) you've identified, drawing directly from the provided ISBD sources. Please note that within the ISBD framework, these are typically referred to as "Areas" or "Elements" rather than formal "Encoding Schemes." The information provided here aims to enhance your understanding of their definitions, required components, punctuation, and relationships within the ISBD standards.

***

### 1. Content Form And Media Type Area Encoding Scheme

*   **Definition:** This area (Area 0) serves to indicate the **fundamental form or forms in which the content of a resource is expressed**, the **method and plan of fixation** of this content in a carrier, and the **type or types of carrier** used to convey that content. Its purpose is to assist catalogue users in identifying and selecting resources, facilitate the exchange of cataloguing records within cooperative networks, and enable interoperability with other metadata standards. This area was a new addition to the 2011 Consolidated Edition of ISBD.
*   **Description of Required Elements:**
  *   **Content form (Mandatory):** Categories reflecting the fundamental forms of content (e.g., dataset, music, image, text). For mixed content, all applicable terms are recorded alphabetically, or "multiple content forms" if three or more apply. Non-predominant content forms may be omitted.
  *   **Content qualification (Mandatory if applicable):** Sub-categories that expand on the content form, specifying type (e.g., cartographic, notated, performed), presence or absence of motion, dimensionality (e.g., 2-dimensional, 3-dimensional), and sensory nature (e.g., visual, tactile, audible).
  *   **Production process (Optional):** Categories reflecting both how content is fixed (e.g., writing, printing, magnetic recording) and the industrial or artisanal method used (e.g., handwriting, daguerreotype). It can be further qualified by "Production process qualification" terms (e.g., published, unpublished).
  *   **Media type (Mandatory):** Categories recording the type of carrier used to convey content (e.g., audio, electronic, unmediated, video). These reflect the format of the storage medium and housing, combined with the intermediation device needed. For mixed media, all applicable terms are recorded, or "multiple media" if three or more apply. If no mediation device is required, "unmediated" is used.
*   **Punctuation:**
  *   **Content qualification terms** are enclosed in **parentheses ( )** immediately following the content form term.
  *   Subsequent **content qualification terms** are preceded by **;**.
  *   The **production process term** is preceded by **:**.
  *   **Production process qualification terms** are enclosed in **parentheses ( )** immediately following the production process term.
  *   The **media type term** is preceded by **;** unless it's the first element and no production process term is given.
  *   When **different content forms** are contained in one media type, each content form term after the first is preceded by **.**.
  *   When a resource consists of **different media types and contains different content forms and production processes**, each subsequent statement is preceded by **+**.
*   **Relationship to ISBD Standards:** This area is identified as **Area 0** in the ISBD specification, making it a foundational element for description within the standard. Its full information aids in universal bibliographic control.
*   **Relationship to other SES within ISBD:**
  *   It contains core elements such as "Content Form And Media Type Statement Encoding Scheme" (which combines Content Form, Production Process, and Media Type).
  *   The "Production process" element was introduced to extend ISBD coverage to **unpublished resources**.
  *   Notes on this area provide additional details and insights, and are given in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — Dataset : electronic**
  *   **. — Text (visual) : handwriting (unpublished) ; unmediated**
  *   **. — Image (cartographic ; moving ; 2-dimensional) : video**
  *   **. — Text (visual) : unmediated + Text (visual) : microform**

### 2. Title And Statement Of Responsibility Area Encoding Scheme

*   **Definition:** This area (Area 1) encompasses information related to the **title proper** of the resource, any **parallel titles**, **other title information**, and **statements of responsibility** concerning the creation or realization of the intellectual or artistic content. It is designed to ensure consistency when sharing bibliographic information.
*   **Description of Required Elements:**
  *   **Title proper (Mandatory if available):** The chief name of the resource, transcribed exactly as to wording from the preferred source. It can be a generic term, a name of a person or corporate body, an initialism/acronym, include numbers/letters, or be linguistically integrated with a statement of responsibility.
  *   **Parallel title (Optional):** A title in another language or script that is an equivalent to the title proper and appears on the preferred source.
  *   **Other title information (Optional):** A word, phrase, or group of characters appearing with and subordinate to the title proper or a parallel title, which qualifies, explains, or completes it.
  *   **Statement of responsibility (Mandatory if available):** Names, phrases, or groups of characters identifying persons or corporate bodies responsible for or contributing to the resource's content (e.g., writers, composers, performers, editors, sponsors). Only principal responsibilities are required, but others may be included if important.
*   **Punctuation:**
  *   Each **parallel title or parallel statement** is preceded by **=**.
  *   Each unit of **other title information** is preceded by **:** (unless linked by a word or phrase).
  *   The **first statement of responsibility** is preceded by **/**.
  *   Each **subsequent statement of responsibility** is preceded by **;** (unless statements form a single phrase).
  *   **Titles of individual works by different authors** are separated by **.**.
  *   **Titles of individual works by the same author** are separated by **;**.
  *   For **common and dependent titles**, each dependent title designation or dependent title is preceded by **.**.
  *   A **dependent title** following a dependent title designation is preceded by **,**.
  *   A dependent title designation or dependent title following other title information is preceded by **.**.
*   **Relationship to ISBD Standards:** Identified as **Area 1**, this is a **mandatory** area and is central to bibliographic description in ISBD. It serves as the basis for the description of the resource being catalogued and employs prescribed punctuation for display.
*   **Relationship to other SES within ISBD:**
  *   It specifies the "Compound Title Of Title Proper Encoding Scheme" and "Compound Title Of Parallel Title Encoding Scheme."
  *   Information that is linguistically part of the title proper is not repeated in the Edition Area (Area 2).
  *   Changes to the title proper can sometimes require a new description (see Area A.2.6.1).
  *   Notes on any aspect of this area, such as sources of title, variant titles, or changes, are provided in the **Note Area (Area 7)**.
*   **Examples:**
  *   **Title proper : other title information**
  *   **Title proper = Parallel title**
  *   **Common title. Dependent title / statement of responsibility**
  *   **Beyond horizons = Allende los horizontes**
  *   **SPSS : statistical package for the social sciences**
  *   **The John Franklin Bardin omnibus / John Franklin Bardin**

### 3. Edition Area Encoding Scheme

*   **Definition:** This area (Area 2) records information about the **edition, drafting, version, etc.**, of a resource. For unpublished resources, it can specify the stage of the production process for pre-publication materials, the state of a drafting, or the version of a file.
*   **Description of Required Elements:**
  *   **Edition, drafting, version, etc. statement (Mandatory if available):** Usually includes the word "edition" (or equivalent) with a number (e.g., "2nd ed."), or a term indicating difference (e.g., "new edition," "revised version," "first draft," "release 0.5").
  *   **Parallel edition, drafting, version, etc. statement (Optional):** An equivalent edition statement in another language or script.
  *   **Statement of responsibility relating to the edition, drafting, version, etc. (Mandatory if available):** Refers to persons or corporate bodies responsible for the specific edition, such as revisers or those providing supplementary matter within that edition.
  *   **Additional edition, drafting, version, etc. statement (Mandatory if available):** A formal statement identifying the resource as belonging to an impression within an edition, or an edition equivalent to the first-named edition, especially if it has significant content differences from other impressions.
  *   **Statement of responsibility relating to an additional edition, drafting, version, etc. statement (Mandatory if available):** Responsibilities related to the additional edition statement.
*   **Punctuation:**
  *   Each **parallel edition, drafting, version, etc. statement** is preceded by **=**.
  *   The **first statement of responsibility** (related to the edition or following an additional statement) is preceded by **/**.
  *   Each **subsequent statement of responsibility** is preceded by **;** (unless statements form a single phrase).
  *   An **additional edition, drafting, version, etc. statement** is preceded by **,**.
*   **Relationship to ISBD Standards:** This is identified as **Area 2** in the ISBD specification. It's crucial for distinguishing different versions or iterations of a work.
*   **Relationship to other SES within ISBD:**
  *   Information related to the production process (e.g., master, matrix) is transcribed in the **Material or Type of Resource Specific Area (Area 3)**, not here.
  *   Edition statements that are an integral part of the title proper or other title information are recorded in the **Title and Statement of Responsibility Area (Area 1)** and not repeated here.
  *   Changes in edition statements for serials or integrating resources may require a new description or be noted in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — 2nd ed.**
  *   **. — Revised version / programmer, Kate Maggor**
  *   **. — Canadian ed. = Éd. canadienne**
  *   **. — 3rd ed., reprinted with a new pref.**
  *   **. — [New ed.]**

### 4. Material Or Type Of Resource Specific Area Encoding Scheme

*   **Definition:** This area (Area 3) is specifically designed to contain **data unique to a particular class of material or type of resource**. It groups together specific elements for cartographic resources, notated music, serials, and unpublished resources.
*   **Description of Required Elements:** The elements in this area are material-specific:
  *   **Mathematical data (Cartographic resources) (Mandatory if applicable):** Includes statement of scale, projection, coordinates, celestial hemisphere, epoch, equinox, and magnitude. (Further detailed in "Mathematical Data Area Encoding Scheme").
  *   **Music format statement (Notated music) (Mandatory if available):** A term describing the physical form of presentation of notated music (e.g., "Full score," "Parts"). (Further detailed in "Music Format Statement Area Encoding Scheme").
  *   **Numbering (Serials) (Mandatory if available):** Numeric and/or chronological designations of the first and/or last issues or parts of a serial. (Further detailed in "Numbering Area Encoding Scheme").
  *   **Unpublished statement (Optional):** A term or phrase indicating the category, nature, or production method of an unpublished resource (e.g., "Master tape," "[Manuscript]"). This element was introduced in the 2021 Update to extend ISBD's coverage.
*   **Punctuation:** The punctuation patterns are specific to each type of material and are set out within their respective sub-sections. The area as a whole is preceded by **. —**. If repeated, each repetition is preceded by **. —**.
*   **Relationship to ISBD Standards:** Identified as **Area 3**, this area allows for specialized descriptive data tailored to different resource types, promoting granular description and harmonization.
*   **Relationship to other SES within ISBD:**
  *   It contains distinct encoding schemes for "Mathematical Data," "Music Format Statement," and "Numbering" for specific material types.
  *   Physical details of materials described here (like the actual pages of a score or the dimensions of an unpublished manuscript) are often provided in the **Material Description Area (Area 5)**.
  *   Notes on this area, providing additional mathematical or numbering details, are found in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — Scale 1:250 000 ; universal transverse Mercator proj.** (Cartographic)
  *   **. — Full score** (Notated Music)
  *   **. — Vol. 1, no. 1 (Jan. 1971)–** (Serials)
  *   **. — Master tape** (Unpublished)

### 5. Publication, Production, Distribution, Etc Area Encoding Scheme

*   **Definition:** This area (Area 4) contains information about the **place of publication, production, and/or distribution**; the **name of the publisher, producer, and/or distributor**; and the **date of publication, production, and/or distribution**. It also records data related to the **physical manufacture** of the resource, such as the place, name, and date of printing or manufacture.
*   **Description of Required Elements:**
  *   **Place of publication, production and/or distribution (Mandatory):** The geographic location associated with the publishing, production, or distribution entity. Multiple places can be recorded.
  *   **Name of publisher, producer and/or distributor (Mandatory):** The person or corporate body responsible for the publication, production, or distribution activities. Multiple names can be recorded.
  *   **Date of publication, production and/or distribution (Mandatory):** The date the resource was officially offered for sale or distribution. Can include copyright dates or legal deposit dates if publication date is unknown.
  *   **Place of printing or manufacture (Optional):** Given when it appears on the resource and publication/distribution details are unknown, or optionally in addition to publication/distribution details.
  *   **Name of printer or manufacturer (Optional):** Given under the same conditions as the place of printing/manufacture.
  *   **Date of printing or manufacture (Optional):** Can be given as an element following the printer/manufacturer or by itself.
*   **Punctuation:**
  *   Each area (other than the first in a paragraph) is preceded by **. —**.
  *   A **second or subsequent place** is preceded by **;** (unless a linking word is given).
  *   Each **name (publisher, producer, distributor)** is preceded by **:** (unless a linking word is given for subsequent names).
  *   **Parallel information** is preceded by **=**.
  *   The **date** is preceded by **,**.
  *   A **hyphen (-) after the date** indicates a continuing resource.
  *   **Printing or manufacturing information** (place, name, date) is enclosed in **one pair of parentheses ( )**.
*   **Relationship to ISBD Standards:** Identified as **Area 4**, this is a mandatory area providing fundamental information for identification and access. For older monographic resources, the distinction between publisher, bookseller, and printer might be undifferentiated.
*   **Relationship to other SES within ISBD:**
  *   It encompasses the "Place Of Publication, Production, Distribution Statement Encoding Scheme," "Name Of Publisher, Producer, Distributor Statement Encoding Scheme," and "Statement Of Printing Or Manufacture Encoding Scheme."
  *   The dates given in the **Numbering Area (Area 3)** for serials may or may not coincide with the dates of publication given in this area.
  *   Changes to information in this area (e.g., place, name of publisher) are often recorded in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — Place of publication or production : name of publisher or producer, date**
  *   **. — London : Methuen, 1979**
  *   **. — [S.l.] : [s.n.], 1974 (Manchester : Unity Press)**
  *   **. — Washington, D.C. : Smithsonian Institution ; New York : distributed by W.W. Norton, 1973** (Example combining elements based on punctuation patterns)

### 6. Material Description Area Encoding Scheme

*   **Definition:** This area (Area 5) describes the **physical characteristics** of the resource. It includes details about the extent, other physical characteristics, dimensions, and any accompanying material. The description should reflect the resource as it was originally issued.
*   **Description of Required Elements:**
  *   **Extent (Mandatory):** Names and numbers the physical unit(s) (e.g., "36 slides," "1 computer disk") and may include subunits like pages or playing time (e.g., "(37 p.)", "(ca 60 min)"). (Further detailed in "Specific Material Designation And Extent Encoding Scheme").
  *   **Other physical details (Optional):** Statement of other characteristics, such as:
    *   **Composition of material** (e.g., "wood," "nitrate").
    *   **Presence of illustrations** (e.g., "ill.", "col. ill.", "chiefly maps").
    *   **Presence of colour** (e.g., "col.", "b&w").
    *   **Reduction ratio** (for microforms, e.g., "14x", "high reduction").
    *   **Presence or absence of sound** (e.g., "sd.", "si.").
    *   **Other technical specifications** (e.g., frame alignment, process of reproduction, playing speed, sound channels, noise reduction). (Further detailed in "Other Physical Details Encoding Scheme").
  *   **Dimensions (Optional):** Linear measurements of the resource, typically in centimetres. For certain media (film, tape), gauge or width in millimetres.
  *   **Accompanying material statement (Optional):** Describes any physically separable material issued with and intended to be used with the resource. A short physical description of the accompanying material may be included.
*   **Punctuation:**
  *   Each area is preceded by **. —**.
  *   The **statement of other physical details** is preceded by **:**.
  *   The **dimensions statement** is preceded by **;**.
  *   Each **accompanying material statement** is preceded by **+**.
  *   **Extent, other physical details, and dimensions of accompanying material** are enclosed in **parentheses ( )**.
*   **Relationship to ISBD Standards:** Identified as **Area 5**, this is a key area for providing physical description of resources. It provides unambiguous information for identification and reference.
*   **Relationship to other SES within ISBD:**
  *   It contains distinct encoding schemes for "Specific Material Designation And Extent Encoding Scheme" and "Other Physical Details Encoding Scheme."
  *   Information about the physical units of notated music and unpublished resources mentioned in Area 3 is specified here.
  *   Notes on this area provide additional physical details or clarify peculiarities, and are found in the **Note Area (Area 7)**.
  *   Accompanying material can alternatively be described independently or in a note.
*   **Examples:**
  *   **. — Specific material designation (extent) : other physical details statement ; dimensions + accompanying material statement**
  *   **. — 1 score (37 p.) + 4 parts on 1 CD-ROM**
  *   **. — 1 videocassette (U-matic) (30 min) : col., sd. ; 18.8 x 10.4 x 2.5 cm**
  *   **. — 1 map : transparency, col. ; 65 x 40 cm + 1 memoir**

### 7. Series And Multipart Monographic Resource Area Encoding Scheme

*   **Definition:** This area (Area 6) is used to indicate that the resource being described belongs to a **larger bibliographic resource**, specifically a series or a multipart monographic resource. It helps to contextualize the individual resource within a broader collection.
*   **Description of Required Elements:**
  *   **Title proper of a series or multipart monographic resource (Mandatory if available):** The collective title of the larger resource, transcribed as it would be if described as a serial or multipart monographic resource.
  *   **Parallel title of a series or multipart monographic resource (Optional):** An equivalent series title in another language or script.
  *   **Other title information of a series or multipart monographic resource (Optional):** Subordinate information qualifying the series title, given if necessary for identification or importance.
  *   **Statement of responsibility relating to a series or multipart monographic resource (Optional):** Identifies persons or corporate bodies responsible for the series, especially if the title is generic, or if considered important.
  *   **International standard number of a series or multipart monographic resource (Mandatory if available):** The ISBN or ISSN related to the series or multipart monographic resource (e.g., ISSN 0306-9222).
  *   **Numbering within a series or multipart monographic resource (Mandatory if available):** The numbering of the specific resource within that series (e.g., "no. 78", "vol. 2").
*   **Punctuation:**
  *   **Each series statement** is enclosed in **parentheses ( )**.
  *   A **second and each subsequent series statement** is preceded by a space.
  *   Each **parallel title or parallel statement** is preceded by **=**.
  *   Each **statement of other title information** is preceded by **:**.
  *   The **first statement of responsibility** is preceded by **/**.
  *   Each **subsequent statement of responsibility** is preceded by **;**.
  *   The **international standard number** is preceded by **,**.
  *   **Numbering within a series or multipart monographic resource** is preceded by **;**.
  *   The **section or subseries designation or dependent title** following a common title is preceded by **.**.
  *   The **dependent title** following a section or subseries designation is preceded by **,**.
*   **Relationship to ISBD Standards:** Identified as **Area 6**, this area helps to establish hierarchical relationships between bibliographic resources. It explicitly uses the concepts of "common title" and "dependent title" for series and subseries.
*   **Relationship to other SES within ISBD:**
  *   It defines how "Title Proper (Compound) Of Series Or Multipart Monographic Resource Encoding Scheme" and "Parallel Title (Compound) Of Series Or Multipart Monographic Resource Encoding Scheme" are applied.
  *   If a resource is part of a subseries with its own ISSN, the ISSN of the main series may be noted in the **Note Area (Area 7)**.
  *   Common titles of a main resource for a supplement or insert may be given in this area.
  *   Information on series editors can also be found in Area 7.
*   **Examples:**
  *   **. — (Title proper of series, ISSN ; numbering within series)**
  *   **. — (Pepys series)**
  *   **. — (Bibliothèque française et romane. Série B, Éditions critiques de textes)**
  *   **. — (Map supplement / Association of American Geographers)**
  *   **. — (Graeco-Roman memoirs, ISSN 0306-9222 ; no. 78)**

### 8. Note Area Encoding Scheme

*   **Definition:** This area (Area 7) is a flexible space for any **descriptive information not given in other areas** but considered important to users of bibliographic records. Notes clarify, amplify, or provide additional insights into the resource's description, bibliographic history, or relationships to other resources.
*   **Description of Required Elements:** Notes are generally **optional**. However, some notes are explicitly designated as "mandatory if applicable and/or available" in the A.3.1 outline for certain elements (e.g., notes on content form and media type). Notes are categorized by the ISBD areas they relate to, but can also cover aspects that don't directly correspond to a specific area.
  *   **Notes on content form and media type (7.0):** (e.g., frequency for continuing resources, system requirements for electronic resources).
  *   **Notes on title and statement of responsibility (7.1):** (e.g., source of title, variant titles, changes to title, explanations about statements of responsibility).
  *   **Notes on edition area and bibliographic history (7.2):** (e.g., source of edition statement, changes to edition, bibliographic history, relationships like translations, reproductions, other editions, supplements, mergers, splits).
  *   **Notes on material or type of resource specific area (7.3):** (e.g., additional mathematical data, music format peculiarities, numbering details for serials, unpublished statement peculiarities).
  *   **Notes on publication, production, distribution, etc., area (7.4):** (e.g., other publishers, variant information, irregularities, additional dates).
  *   **Notes on material description area (7.5):** (e.g., additional physical details, physical peculiarities, other physical formats available).
  *   **Notes on series and multipart monographic resources area (7.6):** (e.g., series editors, main series ISSN for subseries).
  *   **Notes on the contents (7.7):** (e.g., list of contents, indexes, bibliographies).
  *   **Notes on resource identifier and terms of availability area (7.8):** (e.g., limited print run, binding).
  *   **Notes on the issue, part, iteration, etc., that forms the basis of the description (7.9):** (e.g., if description is not based on the first issue/iteration).
  *   **Other notes (7.10):** (e.g., duration for music, astronomical parameters, summary, use/audience).
  *   **Notes relating to the copy in hand (7.11):** (e.g., physical characteristics of the specific copy, "bound with" details, provenance, imperfections).
*   **Punctuation:**
  *   Each **note** is separated from the next by **. —**.
  *   If notes are in separate paragraphs, **. —** is omitted or replaced by a **point (.)** at the end of the preceding note.
  *   Within notes, the **prescribed punctuation of areas 1-6 is recommended**.
  *   **Key title and ISSN** in a note are connected by **=**.
  *   **Title proper and ISSN** in a note are connected by **,**.
*   **Relationship to ISBD Standards:** Identified as **Area 7**, this area provides flexibility and depth to the description, allowing cataloguers to include nuances and specific details that enhance understanding beyond the structured areas.
*   **Relationship to other SES within ISBD:** The Note Area serves as a supplementary and explanatory component for **all other ISBD Areas (0-6, 8)**. Most other SES have cross-references to this area for additional information.
*   **Examples:**
  *   **. — System requirements: Macintosh; at least 1 MB; System 6.0.5 or later**
  *   **. — Title from cover**
  *   **. — Translation of: La muerte de Artemio Cruz**
  *   **. — Includes index**
  *   **. — Imperfect copy: missing cover and title page**

### 9. Resource Identifier And Terms Of Availability Area Encoding Scheme

*   **Definition:** This area (Area 8) includes identifiers (numbers or alphanumeric designations) that identify a resource according to international standards (e.g., ISBN, ISSN, ISMN) or publishers' designations. It also includes statements about the terms under which the resource is available (e.g., price, distribution conditions).
*   **Description of Required Elements:**
  *   **Resource identifier (Optional):**
    *   **Standard identifiers:** ISBN, ISSN, ISMN, URN, DOI, URL, preceded by their customary labels.
    *   **Publisher's number (Notated music only):** Preceded by "Publ. no.".
    *   **Plate number (Notated music only):** Preceded by "Pl. no.".
    *   **Label name and catalogue number (Sound/videorecordings):** The label name followed by all catalogue numbers.
    *   **Fingerprint (Older monographic resources):** A unique alphanumeric string.
    *   **Music incipit (Music manuscripts):** A series of notes from predetermined staves, serving as an identifier.
  *   **Qualification to identifier (Optional):** A brief statement (in parentheses) that qualifies, explains, or corrects the identifier (e.g., binding type, "(corrected)", "(invalid)").
  *   **Key title (Mandatory for continuing resources if ISSN is given):** The unique name assigned by the ISSN Network, inseparably linked to its ISSN.
  *   **Terms of availability (Optional):** The price (with ISO 4217 currency code) or a statement of other terms if not for sale (e.g., "for hire," "free to educational institutions").
  *   **Qualification to terms of availability (Optional):** Qualifications to the terms, enclosed in parentheses (e.g., "(to members)", "(annual subscription)").
*   **Punctuation:**
  *   Each area is preceded by **. —**.
  *   The **key title** is preceded by **=**.
  *   **Terms of availability** are preceded by **:**.
  *   A **qualification** is enclosed in **parentheses ( )**. Multiple qualifiers are separated by **;**.
  *   Each **subsequent identifier and terms of availability statement** (if repeating the area for multiple identifiers) is preceded by **. —**.
*   **Relationship to ISBD Standards:** Identified as **Area 8**, this area provides crucial access and identification points for users, especially for purchasing or locating specific versions of a resource. The area can be repeated if a resource has multiple identifiers.
*   **Relationship to other SES within ISBD:**
  *   It contains the "Resource Identifier Statement Encoding Scheme" and "Terms Of Availability Statement Encoding Scheme."
  *   Identifiers relating to bibliographic history (e.g., ISBNs for earlier editions) are typically not included here but can be given in the **Note Area (Area 7)**.
  *   Physical details related to different formats might be recorded here if omitted from Area 5.
  *   The "Label name and catalogue number" here is distinct from publisher names in Area 4.
*   **Examples:**
  *   **. — ISBN 978-952-92-0267-6**
  *   **. — ISSN 0075-2363 = Medicos (Nottingham)**
  *   **. — ISBN 978-0-85020-025-6 (cloth)**
  *   **. — Telefunken 6.35368**
  *   **. — Fingerprint:163704 - b1 A2 ,$en : b2 I2 a,$**

### 10. Mathematical Data Area Encoding Scheme

*   **Definition:** This is a sub-area within the **Material or Type of Resource Specific Area (Area 3)** specifically for **cartographic resources**. It includes details like scale, projection, coordinates, celestial hemisphere, epoch, equinox, and magnitude, which are essential for describing maps, charts, and globes.
*   **Description of Required Elements:**
  *   **Statement of scale (Mandatory if applicable):** Given as a representative fraction (e.g., "1:25 000"). Can include vertical scale for relief models or angular scale for celestial charts.
  *   **Statement of projection (Mandatory if available):** The name of the projection (e.g., "universal transverse Mercator proj."), possibly with associated phrases.
  *   **Statement of coordinates and celestial hemisphere (Mandatory if available):** This covers:
    *   **Terrestrial coordinates:** Longitude and latitude in degrees, minutes, and seconds, with cardinal directions.
    *   **Celestial coordinates (Right ascension and declination):** RA in hours/minutes/seconds and Decl. in degrees/minutes/seconds, with +/- for hemispheres.
    *   **Other celestial coordinate systems:** Ecliptic, galactic, supergalactic coordinates.
    *   **Celestial hemisphere:** Indication of northern, southern, or both hemispheres.
  *   **Statement of epoch and equinox (Mandatory if available):** A reference moment in time for position measurements (epoch) and one of the intersection points of the ecliptic and celestial equator (equinox).
  *   **Statement of magnitude (Mandatory if available):** For celestial charts, the brightness magnitude (e.g., "limiting magnitude 3.5").
*   **Punctuation:**
  *   The **projection statement** is preceded by **;**.
  *   The statements of **coordinates, celestial hemisphere, epoch and equinox** are enclosed in **one pair of parentheses ( )**.
  *   The **statement of equinox** is preceded by **;**.
  *   The **statement of celestial hemisphere** is preceded by **;**.
  *   The **statement of magnitude** is preceded by **;**.
  *   Within coordinates, pairs are separated by **/** (no space), and ranges by **–** (no space).
*   **Relationship to ISBD Standards:** This is element **3.1** within Area 3. The 2021 Update broadened and refined the description of cartographic resources, clarifying stipulations and reorganizing elements, especially for celestial cartography.
*   **Relationship to other SES within ISBD:** It is a key component of the "Material Or Type Of Resource Specific Area Encoding Scheme." Notes can provide additional mathematical or cartographic data, including details on digital graphic representation.
*   **Examples:**
  *   **. — Scale 1:250 000 ; universal transverse Mercator proj.**
  *   **. — Scale 1:25 000 (E 79°–E 86°/N 20°–N 12°)**
  *   **. — RA 16 h/Decl. -23° ; equinox 1950)**

### 11. Music Format Statement Area Encoding Scheme

*   **Definition:** This is a sub-area within the **Material or Type of Resource Specific Area (Area 3)**, used specifically for **notated music resources**. It describes the **physical form of presentation** of the music (e.g., "Full score," "Chorus score," "Parts"). It is not used for works for solo instruments/voices or one voice and one accompanying instrument.
*   **Description of Required Elements:**
  *   **Music format statement (Mandatory if available):** The term or phrase for the physical presentation form, transcribed as it appears on the resource. Explanatory phrases may be included.
  *   **Parallel music format statement (Optional):** An equivalent music format statement in another language or script.
*   **Punctuation:**
  *   Each area is preceded by **. —**.
  *   Each **parallel music format statement** is preceded by **=**.
*   **Relationship to ISBD Standards:** This is element **3.2** within Area 3. It's a key part of the specialized description for notated music.
*   **Relationship to other SES within ISBD:**
  *   It is a component of the "Material Or Type Of Resource Specific Area Encoding Scheme."
  *   Details of the physical units (e.g., number of pages, dimensions) are given in the **Material Description Area (Area 5)**.
  *   If the term "edition" in the resource indicates version or arrangement of music, it's given in Area 1; if it indicates the music format, it's given in this area.
  *   Notes on music format peculiarities are given in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — Full score**
  *   **. — Partition, reproduction du manuscrit de l'auteur**
  *   **. — Játszópartitúra = Playing score**

### 12. Numbering Area Encoding Scheme

*   **Definition:** This is a sub-area within the **Material or Type of Resource Specific Area (Area 3)**, specifically for **serials**. It records the **numeric and/or chronological designation** of the first and/or last issue or part of the serial.
*   **Description of Required Elements:**
  *   **Numeric designation (Mandatory if available):** Numbers (arabic numerals preferred) with or without accompanying characters/words (e.g., "Vol. 1, no. 1", "Bd. 1–").
  *   **Chronological designation (Mandatory if available):** Dates (e.g., "Jan. 1970", "1925–").
  *   **Parallel numbering system (Optional):** Designations in another language or script for the same issues.
  *   **Alternative numbering system (Optional):** A different numbering system used concurrently.
  *   **New sequence of numbering (Optional):** The designation and numbering for a new sequence when the serial continues under a new numbering scheme (e.g., "new ser., v. 1–").
*   **Punctuation:**
  *   A **hyphen (–)** after the number/date of the first issue links to the last issue or indicates it is continuing.
  *   If both **numeric and chronological designations** are present, the date is enclosed in **parentheses ( )** after the number, unless the number is a division of the date.
  *   The **second and each subsequent system of numbering** (parallel or alternative) is preceded by **=**.
  *   A **new sequence of numbering** is preceded by **;**.
*   **Relationship to ISBD Standards:** This is element **3.3** within Area 3. It provides specific, standardized numbering information critical for identifying and managing serial resources.
*   **Relationship to other SES within ISBD:**
  *   It is a component of the "Material Or Type Of Resource Specific Area Encoding Scheme."
  *   The dates in this area may not coincide with publication dates in the **Publication, Production, Distribution, Etc. Area (Area 4)**.
  *   Major changes in numbering can require a new description for the serial (see Area A.2.6).
  *   Notes on complex, irregular numbering, or explanations for omissions are given in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — Vol. 1, no. 1 (Jan. 1971)–**
  *   **. — 1971, no. 1 (Jan. 1971)–1975, no. 12 (Dec. 1975)**
  *   **. — Bd. 1, Nr. 1 (Frühling 1970)– = Nr. 1–**
  *   **. — 1–v. 101 ; new ser., v. 1–**

### 13. Specific Material Designation And Extent Encoding Scheme

*   **Definition:** This refers to the naming and numbering of the physical unit(s) that constitute the resource, along with other measures of its extent. It is the **first element** in the **Material Description Area (Area 5)** [411, 5.1]. The **specific material designation (SMD)** identifies the specific class of physical object.
*   **Description of Required Elements:**
  *   **Number of physical units (Optional):** Given in arabic numerals (e.g., "36"). This is omitted if the resource is still being issued or the number is unknown.
  *   **Specific material designation (Mandatory):** A term indicating the type of physical unit (e.g., "slides," "atlas," "computer disk," "website"). Terms are not prescribed and may be abbreviated.
  *   **Subunits (Optional):** The number and type of internal subunits (e.g., pages, leaves, frames, pieces) and/or playing time, enclosed in parentheses (e.g., "(37 p.)", "(ca 60 min)").
*   **Punctuation:**
  *   The **subunits statement** is enclosed in **parentheses ( )**.
  *   For multimedia resources, components are separated by **,**.
*   **Relationship to ISBD Standards:** This is element **5.1** within Area 5. It is fundamental to the physical description of a resource, providing a concise summary of its physical form and quantity.
*   **Relationship to other SES within ISBD:**
  *   It is a component of the "Material Description Area Encoding Scheme."
  *   Playing time (5.1.5) and pagination (5.1.4) are detailed aspects of this element.
  *   It is closely related to the "Content Form And Media Type Area Encoding Scheme" (Area 0), as the physical carrier described here is the "Media type" in Area 0.
  *   For component parts, this information may be inferred from the host and location, and thus omitted from the part's description itself.
  *   Notes on extent (e.g., if numbering gives a false impression, or if it differs from bibliographic units) are given in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — 36 slides**
  *   **. — 1 computer disk**
  *   **. — 1 score (37 p.)**
  *   **. — 1 website**
  *   **. — 3 filmstrips, 1 map, 13 rocks and minerals, 1 wallchart**

### 14. Other Physical Details Encoding Scheme

*   **Definition:** This element within the **Material Description Area (Area 5)** provides a statement of **additional physical characteristics** of the resource beyond its extent and dimensions. This includes details like material composition, presence of colour or illustrations, and various technical specifications.
*   **Description of Required Elements (all optional):**
  *   **Composition of material:** Word or phrase indicating what the resource is made of (e.g., "wood," "nitrate," "transparency").
  *   **Presence of illustrations:** Abbreviation "ill." (or equivalent). Can specify "all ill." or "chiefly maps".
  *   **Presence of colour:** "col." for colour, "b&w" for black and white.
  *   **Reduction ratio (Microforms):** Numerical ratio (e.g., "14x," "150x") or descriptive terms (e.g., "low reduction").
  *   **Presence or absence of sound:** "sd." for sound, "si." for silent, when not implicit in the specific material designation (e.g., for film reels). Brief explanatory phrases can be added (e.g., "(Beta HiFi)").
  *   **Other technical specifications:**
    *   **Frame alignment** (for microforms/filmstrips, e.g., "cine mode," "comic mode").
    *   **Process or method of reproduction** (for still images, e.g., "drypoint, aquatint").
    *   **Playing speed** (e.g., "33 1/3 rpm," "19 cm/s").
    *   **Recording method** (e.g., "stereo," "mono").
    *   **Groove direction/size** (for sound discs).
    *   **Number of tape tracks**.
    *   **Track configuration** (for sound reels with 4+ tracks).
    *   **Number of sound channels** (e.g., "mono," "stereo").
    *   **Equalization**.
    *   **Noise reduction**.
*   **Punctuation:** This statement is preceded by **:** within Area 5.
*   **Relationship to ISBD Standards:** This is element **5.2** within Area 5. It provides granular details about the physical manifestation of the resource.
*   **Relationship to other SES within ISBD:**
  *   It is a component of the "Material Description Area Encoding Scheme."
  *   If a resource is available in alternative formats with different physical details, this information may be omitted here and given in **Area 8 (Resource Identifier and Terms of Availability Area)** or the **Note Area (Area 7)**.
  *   Notes providing additional physical details or peculiar characteristics are given in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — 1 globe : wood**
  *   **. — 1 film reel (20 min) : b&w, si.**
  *   **. — 1 sound disc : 33 1/3 rpm, stereo**
  *   **. — 1 CD-I : col., sd.**

### 15. Statement Of Coordinates And Equinox Encoding Scheme

*   **Definition:** This refers to the combined statement of coordinates (terrestrial or celestial), celestial hemisphere, epoch, and equinox for **cartographic resources**. It is a crucial part of the **Mathematical Data (Area 3.1)**. While the query lists "Statement of Coordinates and Equinox", the ISBD sources show "Statement of coordinates and celestial hemisphere" (3.1.3) and "Statement of epoch and equinox" (3.1.4) as distinct elements, which are often grouped together in punctuation.
*   **Description of Required Elements:**
  *   **Coordinates (Mandatory if applicable):**
    *   **Terrestrial coordinates:** Longitude (W/E) and latitude (N/S) given in degrees, minutes, seconds (e.g., "E 79°–E 86°/N 20°–N 12°").
    *   **Right ascension and declination (Celestial):** RA in hours, minutes, seconds and Decl. in degrees, minutes, seconds (with + for northern, - for southern celestial hemisphere).
    *   **Other celestial coordinate systems:** Decimal degrees for longitude and latitude, with the name of the system (e.g., "ecliptic coordinates").
  *   **Celestial hemisphere (Optional):** Specifies the northern, southern, or both celestial hemispheres.
  *   **Epoch (Mandatory if available):** An arbitrary moment in time to which measurements of position are referred.
  *   **Equinox (Mandatory if available):** One of two points of intersection of the ecliptic and the celestial equator, occupied by the sun when its declination is 0°.
*   **Punctuation:**
  *   The statements of **coordinates, celestial hemisphere, epoch, and equinox** are enclosed in **one pair of parentheses ( )**.
  *   The **statement of celestial hemisphere** is preceded by **;**.
  *   The **statement of equinox** is preceded by **;**.
  *   Within coordinate ranges, individual values are linked by **–** (no space) and different coordinate types by **/** (no space).
*   **Relationship to ISBD Standards:** This combines elements **3.1.3** and **3.1.4** within the Mathematical Data Area (element 3.1, part of Area 3). The 2021 Update refined these stipulations, especially for celestial cartography.
*   **Relationship to other SES within ISBD:** It is a key part of the "Mathematical Data Area Encoding Scheme," which is itself part of the "Material Or Type Of Resource Specific Area Encoding Scheme." Notes can provide further elaboration.
*   **Examples:**
  *   **(E 79°–E 86°/N 20°–N 12°)**
  *   **(RA 16 h 30 min to 19 h 30 min/Decl. -16° to -49° ; southern celestial hemisphere)**
  *   **(RA 2 h/Decl. +30° ; equinox 1950)**

### 16. Place Of Publication, Production, Distribution Statement Encoding Scheme

*   **Definition:** This refers to element **4.1** within the **Publication, Production, Distribution, Etc. Area (Area 4)**. It specifies the **name of the place associated with the publisher, producer, or distributor**, or the place from which the resource was issued or distributed.
*   **Description of Required Elements:**
  *   **Place name (Mandatory):** The name of the city or town (e.g., "London," "Baltimore"). If unknown or uncertain, it can be supplied in square brackets, possibly with a question mark.
  *   **Larger place (Optional):** The name of a country, state, etc., added for identification (e.g., "Washington, D.C.", "Cambridge, Mass."). This is preceded by a comma if from the source, or in square brackets if supplied.
  *   **Full address (Optional):** The full address of the publisher, producer, or distributor, if necessary for identification. Enclosed in parentheses if from source, or square brackets if supplied.
  *   **Alternative/corrected version (Optional):** If the given place name is incorrect, a correction can be supplied (e.g., "Paris [i.e. Leiden]", "Christiania [Oslo]").
*   **Punctuation:**
  *   A **second or subsequent place** is preceded by **;** (unless a linking word or phrase is given).
  *   **Supplied information** (e.g., unknown place, additions for identification) is enclosed in **square brackets [ ]**.
  *   The **abbreviation s.l. (sine loco)** is supplied in square brackets if no place can be determined.
*   **Relationship to ISBD Standards:** This is element **4.1** within Area 4. It is a mandatory element in the bibliographic description.
*   **Relationship to other SES within ISBD:**
  *   It is a component of the "Publication, Production, Distribution, Etc Area Encoding Scheme."
  *   It is inherently linked to the "Name Of Publisher, Producer, Distributor Statement Encoding Scheme" (element 4.2), as the place is associated with that name.
  *   Changes in the place of publication for continuing resources or multipart monographic resources are noted in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — London**
  *   **. — Washington, D.C.**
  *   **. — Santiago [Chile]**
  *   **. — [S.l.]**
  *   **. — Paris (66, avenue de Versailles, 75016)**

### 17. Name Of Publisher, Producer, Distributor Statement Encoding Scheme

*   **Definition:** This refers to element **4.2** within the **Publication, Production, Distribution, Etc. Area (Area 4)**. It identifies the **person or corporate body responsible for the publication, production, and/or distribution** activities for the resource. For older monographic resources, this can include booksellers or printers.
*   **Description of Required Elements:**
  *   **Name (Mandatory):** The name of the publisher, producer, or distributor. If multiple names, the most prominent or first appearing is given. All names are generally transcribed for older monographic resources.
  *   **Function (Optional):** A brief word or phrase indicating the function of a distributor, if not explicitly stated on the resource (e.g., "[distributor]").
*   **Punctuation:**
  *   The **name** is preceded by **:** after the place of publication.
  *   If **multiple names** are given, they may be separated by **:** or simply follow one another if linked by words.
  *   If **second or subsequent names are omitted**, the omission can be indicated by "**[etc.]**".
  *   The **abbreviation s.n. (sine nomine)** is supplied in square brackets if no name can be given.
  *   **Supplied information** is enclosed in **square brackets [ ]**.
*   **Relationship to ISBD Standards:** This is element **4.2** within Area 4. It is a mandatory element for bibliographic description.
*   **Relationship to other SES within ISBD:**
  *   It is a component of the "Publication, Production, Distribution, Etc Area Encoding Scheme."
  *   It is inherently linked to the "Place Of Publication, Production, Distribution Statement Encoding Scheme" (element 4.1).
  *   **Label names** (for sound recordings, etc.) are generally **not transcribed** here, but may appear in Area 6 (Series) or Area 8 (Resource Identifier and Terms of Availability Area).
  *   Changes in the name of the publisher for continuing resources or multipart monographic resources are noted in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — London : Methuen**
  *   **. — Paris : Gallimard : Julliard**
  *   **. — Washington, D.C. : Smithsonian Institution ; New York : distributed by W.W. Norton**
  *   **: [s.n.]**

### 18. Statement Of Printing Or Manufacture Encoding Scheme

*   **Definition:** This refers to elements **4.4 (Place of printing or manufacture), 4.5 (Name of printer or manufacturer), and 4.6 (Date of printing or manufacture)** within the **Publication, Production, Distribution, Etc. Area (Area 4)**. It records information about the **physical production** of the resource, which is distinct from its publication or distribution.
*   **Description of Required Elements:** All elements within this scheme are **Optional**.
  *   **Place of printing or manufacture:** Given when it appears on the resource and publication/distribution details are unknown, or optionally in addition to publication/distribution details.
  *   **Name of printer or manufacturer:** Given under the same conditions as the place of printing/manufacture.
  *   **Date of printing or manufacture:** May be given following the printer/manufacturer or by itself with a clarifying word/phrase (e.g., "1981 printing").
*   **Punctuation:** The **entire statement (place, name, and date of printing/manufacture)** is enclosed in **one pair of parentheses ( )**. Within these parentheses, the same punctuation rules apply as in the rest of Area 4 (e.g., **;** for subsequent place, **:** for name, **,** for date).
*   **Relationship to ISBD Standards:** These are elements **4.4, 4.5, and 4.6** within Area 4. This scheme provides additional manufacturing details, particularly relevant for older monographic resources where printing and publishing functions might be intertwined or unclear.
*   **Relationship to other SES within ISBD:**
  *   It is a component of the "Publication, Production, Distribution, Etc Area Encoding Scheme."
  *   If no date of publication is available, the date of printing or manufacture can serve as a substitute date in Area 4.
  *   Notes can clarify the source of this information if not from a prescribed source.
*   **Examples:**
  *   **. — [S.l.] : [s.n.], 1974 (Manchester : Unity Press)**
  *   **. — London : IFLA Committee on Cataloguing, 1975 (London : Palantype Organisation)**
  *   **. — [出版地不明] : [出版者不明], 1963 製作 ([東京] : 鹿島研究所出版会)**

### 19. Compound Title Of Title Proper Encoding Scheme

*   **Definition:** This refers to a specific form of the **title proper (element 1.1)**, which consists of a **common title** and a **dependent title**, optionally including a dependent title designation. The common title is shared by a group of related resources, while the dependent title (and designation) uniquely identifies a specific resource within that group.
*   **Description of Required Elements:**
  *   **Common title (Mandatory if applicable):** The unifying title [1.1.3.7, 636].
  *   **Dependent title designation (Optional):** Numbering or a designation that distinguishes one resource from others with the same common title (e.g., "Part 2," "Vol. 46") [1.1.3.7, 643].
  *   **Dependent title (Mandatory if applicable):** The specific title that, combined with the common title, identifies the resource (e.g., "Norwegian journal of entomology" in "Fauna Norvegica. Series B, Norwegian journal of entomology") [1.1.3.7, 642].
*   **Punctuation:**
  *   Each **dependent title designation** (if any) or each **dependent title** following the common title is preceded by **.**.
  *   Each **dependent title** following a dependent title designation is preceded by **,**.
*   **Relationship to ISBD Standards:** This is a specific structure for element **1.1 (Title proper)**, detailed in **1.1.3.7** of the ISBD. It's a way to describe resources that are part of a larger, formally structured set.
*   **Relationship to other SES within ISBD:**
  *   It is a form within the "Title And Statement Of Responsibility Area Encoding Scheme."
  *   This structure is also applied to titles in the **Series and Multipart Monographic Resource Area (Area 6)** [471, see "Title Proper (Compound) Of Series Or Multipart Monographic Resource Encoding Scheme"].
  *   If a section, supplement, or part has a title insufficient to identify it alone, this compound structure is used for the title proper.
  *   Other title information relating to the dependent title follows it, but information for the common title may be given in Area 6 or Area 7.
*   **Examples:**
  *   **Internationale Quartär-Karte von Europa. Blatt 8, Magnitogorsk**
  *   **Crecer como hijos de Dios. Libro del catequista**
  *   **采矿设计师手册. 4, 矿山机械卷**

### 20. Title Proper (Compound) Of Series Or Multipart Monographic Resource Encoding Scheme

*   **Definition:** This refers to the title proper within the **Series and Multipart Monographic Resource Area (Area 6)** when the series or multipart monographic resource follows a **common title and dependent title** structure. This mirrors the structure of a compound title proper for individual resources but applies it to the larger bibliographic unit.
*   **Description of Required Elements:**
  *   **Common title of a series or multipart monographic resource (Mandatory if applicable):** The collective title for the main series or multipart monographic resource.
  *   **Section/subseries designation (Optional):** A designation (e.g., "Série B") that identifies a specific subseries or part within the main series.
  *   **Dependent title of a series or multipart monographic resource (Mandatory if applicable):** The specific title of the subseries or part (e.g., "Éditions critiques de textes").
*   **Punctuation:**
  *   The **section or subseries designation or dependent title** following a common title is preceded by **.**.
  *   The **dependent title** following a section or subseries designation is preceded by **,**.
  *   The **entire series statement** is enclosed in **parentheses ( )**.
*   **Relationship to ISBD Standards:** This is an application of the compound title structure (from 1.1.3.7) to element **6.1 (Title proper of a series or multipart monographic resource)** in Area 6. It's used when the series itself has a hierarchical title structure.
*   **Relationship to other SES within ISBD:**
  *   It is a form within the "Series And Multipart Monographic Resource Area Encoding Scheme."
  *   It directly relates to the "Compound Title Of Title Proper Encoding Scheme" (1.1.3.7) but applies it to the series level.
  *   If the numbering of the common title or main series is not given here, it may be provided in the **Note Area (Area 7)**.
  *   Other title information relating to the dependent title may follow it, but for the common title, it is omitted or given in Area 7.
*   **Examples:**
  *   **(Acta Universitatis Carolinae. Philologica)**
  *   **(Viewmaster science series. 4, Physics)**
  *   **(Bibliothèque française et romane. Série B, Éditions critiques de textes)**

### 21. Parallel Title (Compound) Of Series Or Multipart Monographic Resource Encoding Scheme

*   **Definition:** This refers to a **parallel title** for a series or multipart monographic resource that is also structured with a **common title and a dependent title**. It is an equivalent of a compound series title proper in another language or script [6.2.2, 482].
*   **Description of Required Elements:**
  *   **Parallel common title (Optional):** The equivalent of the series common title in another language or script [6.2.2].
  *   **Parallel dependent title (Optional):** The equivalent of the series dependent title in another language or script [6.2.2].
*   **Punctuation:**
  *   The **entire parallel title statement** (including its compound parts) is preceded by **=**.
  *   The dependent part follows the common part, generally separated by a **point (.)** [484, example from 1.2.5.5].
  *   The **entire series statement** is enclosed in **parentheses ( )**.
*   **Relationship to ISBD Standards:** This is element **6.2.2** within the Series and Multipart Monographic Resource Area (Area 6). It applies the compound title structure to parallel series titles.
*   **Relationship to other SES within ISBD:**
  *   It is a form within the "Series And Multipart Monographic Resource Area Encoding Scheme."
  *   It is analogous to the "Compound Title Of Parallel Title Encoding Scheme" (1.2.5.5) but applied to the series level.
*   **Examples:**
  *   **(Sounds of the theatre. Music = Voci del teatro. La musica)**
  *   **(中国动物志. 昆虫纲. 第四十六卷, 膜翅目. 茧蜂科(四). 窄径茧蜂亚科 = Fauna sinica. Insecta. Vol. 46, Hymenoptera. Braconidae (IV). Agathidinae)** (This example from Area 1 illustrates the compound parallel title structure, which is applied to series as well).

### 22. Compound Title Of Parallel Title Encoding Scheme

*   **Definition:** This refers to a **parallel title** (element 1.2) that itself consists of a **common title and a dependent title**, serving as an equivalent in another language or script to a compound title proper.
*   **Description of Required Elements:**
  *   **Parallel common title (Optional):** The equivalent of the common title of the title proper in another language or script [1.2.5.5, 196].
  *   **Parallel dependent title (Optional):** The equivalent of the dependent title of the title proper in another language or script [1.2.5.5, 196].
*   **Punctuation:**
  *   The **entire parallel title statement** (including its compound parts) is preceded by **=** within the Title and Statement of Responsibility Area (Area 1).
  *   The dependent part follows the common part, generally separated by a **point (.)**.
*   **Relationship to ISBD Standards:** This is a specific structure for element **1.2 (Parallel title)**, detailed in **1.2.5.5** of the ISBD. It is used when the main title is compound and its parallel equivalent is also structured in parts.
*   **Relationship to other SES within ISBD:**
  *   It is a form within the "Title And Statement Of Responsibility Area Encoding Scheme."
  *   It applies the "Compound Title Of Title Proper Encoding Scheme" (1.1.3.7) to parallel titles.
  *   Changes to parallel titles for continuing resources may be noted in the **Note Area (Area 7)**.
*   **Examples:**
  *   **Godišen zbornik na Zemjodelsko-šumarskiot fakultet na Univerzitetot vo Skopje. Zemjodelstvo = Annuaire de la Faculté d’agriculture et de sylviculture de l’Université de Skopje. Agriculture**

### 23. Content Form And Media Type Statement Encoding Scheme

*   **Definition:** This refers to the **combined, formatted statement** of the content form(s), production process (if applicable), and media type(s) that forms the core description within **Area 0 (Content Form, Production Process and Media Type Area)**. It provides an immediate overview of what the resource contains and on what physical carrier it exists.
*   **Description of Required Elements:** It combines the elements from Area 0:
  *   **Content form:** (Mandatory) The fundamental form (e.g., "Text," "Image," "Dataset").
  *   **Content qualification:** (Mandatory if applicable) Specific attributes (e.g., "(visual)", "(cartographic ; still ; 2-dimensional)").
  *   **Production process:** (Optional) Method of fixation and production (e.g., "handwriting," "burning").
  *   **Production process qualification:** (Optional) Status of production (e.g., "(unpublished)").
  *   **Media type:** (Mandatory) Type of carrier (e.g., "electronic," "unmediated," "video").
*   **Punctuation:** The punctuation patterns define how these elements are combined:
  *   **Content form (content qualification) : production process (production process qualification) ; media type**.
  *   **Content form (content qualification ; content qualification) : media type**.
  *   **Content form. Content form (content qualification) : media type** (for different content forms in one media type).
  *   **Content form (content qualification) : production process ; media type + Content form (content qualification) : production process (production process qualification) ; media type** (for different media types, content forms, and production processes).
*   **Relationship to ISBD Standards:** This is the primary output of **Area 0**, explicitly detailing its structured nature. It was a significant development in the 2011 consolidated edition to provide greater specificity.
*   **Relationship to other SES within ISBD:** It integrates the "Content Form," "Production Process," and "Media Type" elements (which themselves could be considered mini-SES) into a coherent statement. It's the practical application of the "Content Form And Media Type Area Encoding Scheme."
*   **Examples:**
  *   **Dataset : electronic**
  *   **Text (visual) : handwriting (unpublished) ; unmediated**
  *   **Image (cartographic ; still ; 2-dimensional ; visual) : unmediated**
  *   **Text (visual) : unmediated + Text (visual) : microform**

### 24. Terms Of Availability Statement Encoding Scheme

*   **Definition:** This refers to element **8.3** within the **Resource Identifier and Terms of Availability Area (Area 8)**. It provides a statement of the **conditions under which a resource may be obtained**, typically its price, or a brief statement if it's not for sale (e.g., "for hire," "free to educational institutions").
*   **Description of Required Elements:** The element is **Optional**.
  *   **Price (Optional):** Given with the international standard code for the currency (e.g., "GBP 2.05," "EUR 950").
  *   **Other terms (Optional):** A brief statement for non-sale availability (e.g., "not for sale," "for hire," "free loan").
  *   **Qualifications (Optional):** Brief statements (in parentheses) clarifying the terms (e.g., "(to members)", "(until 1 January 1977)", "(annual subscription)").
*   **Punctuation:**
  *   The **terms of availability** are preceded by **:**.
  *   **Qualifications** are enclosed in **parentheses ( )**.
  *   If multiple terms or qualifications are needed, they are separated as appropriate, usually by **:** for distinct terms or **;** for multiple qualifications.
*   **Relationship to ISBD Standards:** This is element **8.3** within Area 8. It provides practical information about access to the resource.
*   **Relationship to other SES within ISBD:**
  *   It is a component of the "Resource Identifier And Terms Of Availability Area Encoding Scheme."
  *   Notes related to terms of availability (e.g., limited print run, limited distribution) can be found in the **Note Area (Area 7)**.
*   **Examples:**
  *   **: GBP 2.05**
  *   **: not for sale**
  *   **: USD 129.00 : USD 100.00 (for colleges and universities)**
  *   **: EUR 4 (annual subscription) : EUR 1,20 (per issue)**

### 25. Resource Identifier Statement Encoding Scheme

*   **Definition:** This refers to element **8.1** within the **Resource Identifier and Terms of Availability Area (Area 8)**. It provides a **number or alphanumeric designation** that uniquely identifies a resource. This can include international standard identifiers (like ISBN, ISSN, ISMN, URN, DOI, URL) or designations assigned by a publisher (like publisher's numbers, plate numbers, or label names with catalogue numbers). For older monographic resources and music manuscripts, it also includes "Fingerprint" and "Music incipit" as identifiers.
*   **Description of Required Elements:** The element is **Optional**.
  *   **Standard identifier (Optional):** Recorded with its customary label (e.g., "ISBN 978-952-92-0267-6," "ISSN 0075-2363," "doi:10.1000/1").
  *   **Publisher's number (Optional, for notated music):** Preceded by "Publ. no.".
  *   **Plate number (Optional, for notated music):** Preceded by "Pl. no.".
  *   **Qualification to identifier (Optional):** A brief statement in parentheses to qualify, explain, or correct the identifier (e.g., "(cloth)", "(corrected)", "(invalid)").
  *   **Label name and catalogue number (Optional, for sound/videorecordings):** The label name followed by all catalogue numbers supplied by the issuing company (e.g., "Telefunken 6.35368").
  *   **Fingerprint (Mandatory if available, for older monographic resources):** An alphanumeric string derived from the text (e.g., "163704 - b1 A2 ,$en : b2 I2 a,$").
  *   **Music incipit (Optional, for music manuscripts):** A series of notes from a musical work, serving as an identifier.
*   **Punctuation:**
  *   The identifier is the **first element** in its statement within Area 8 and is not preceded by prescribed punctuation.
  *   **Qualifications** are enclosed in **parentheses ( )**. Multiple qualifications are separated by **;**.
  *   If **multiple identifiers** for the same resource (e.g., for different formats or parts) are given by repeating the area, each subsequent statement is preceded by **. —**.
  *   A **plate number** following an ISBN or publisher's number is preceded by **. —**.
*   **Relationship to ISBD Standards:** This is element **8.1** within Area 8. It provides standardized, unique identification for resources, aiding in their discovery and management.
*   **Relationship to other SES within ISBD:**
  *   It is a component of the "Resource Identifier And Terms Of Availability Area Encoding Scheme."
  *   It directly relates to the "Key title" (element 8.2), which is given only if the ISSN (a type of resource identifier) is also given.
  *   Identifiers for earlier editions or bibliographic history are not given here but may be recorded in the **Note Area (Area 7)**.
*   **Examples:**
  *   **. — ISBN 978-952-92-0267-6**
  *   **. — ISSN 0075-2363**
  *   **. — ISMN 979-0-3217-6543-6 (score)**
  *   **. — Telefunken 6.35368**
  *   **. — Fingerprint:163704 - b1 A2 ,$en : b2 I2 a,$**
