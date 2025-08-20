'use client';

import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select, Button } from 'antd';
import { useNavigation } from '@refinedev/core';

/**
 * Create New RDF Build Page
 */
export default function CreateRdfBuildPage() {
  const { list } = useNavigation();
  const { formProps, saveButtonProps } = useForm({
    resource: 'rdf-builds',
    action: 'create',
    redirect: 'list',
  });

  return (
    <Create
      title="Create RDF Build"
      breadcrumb={
        <Button onClick={() => list('rdf-builds')}>
          Back to List
        </Button>
      }
      saveButtonProps={saveButtonProps}
    >
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Namespace"
          name="namespace"
          rules={[{ required: true, message: 'Please select a namespace' }]}
        >
          <Select placeholder="Select namespace">
            <Select.Option value="isbd">ISBD</Select.Option>
            <Select.Option value="isbdm">ISBD-M</Select.Option>
            <Select.Option value="lrm">LRM</Select.Option>
            <Select.Option value="frbr">FRBR</Select.Option>
            <Select.Option value="muldicat">MulDiCat</Select.Option>
            <Select.Option value="unimarc">UNIMARC</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Format"
          name="format"
          rules={[{ required: true, message: 'Please select a format' }]}
        >
          <Select placeholder="Select format">
            <Select.Option value="turtle">Turtle</Select.Option>
            <Select.Option value="jsonld">JSON-LD</Select.Option>
            <Select.Option value="rdfxml">RDF/XML</Select.Option>
            <Select.Option value="ntriples">N-Triples</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Options"
          name="options"
        >
          <Input.TextArea
            rows={4}
            placeholder="Additional build options (JSON format)"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <Input.TextArea
            rows={4}
            placeholder="Build description or notes"
          />
        </Form.Item>
      </Form>
    </Create>
  );
}