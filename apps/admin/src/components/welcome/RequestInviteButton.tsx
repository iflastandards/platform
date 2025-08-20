'use client';

import { useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  Typography,
  message,
} from 'antd';

const { Text } = Typography;

export default function RequestInviteButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRequest = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const res = await fetch('/api/request-invite', {
        method: 'POST',
        body: JSON.stringify({ email: values.email }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (res.ok) {
        message.success('Invitation sent successfully!');
        setOpen(false);
        form.resetFields();
      } else {
        message.error('Error sending invitation. Please try again.');
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="link"
        size="small"
        style={{ 
          fontWeight: 'bold', 
          fontSize: '14px',
          textDecoration: 'underline',
          padding: '4px 8px',
        }}
        onClick={() => setOpen(true)}
      >
        Request Invitation
      </Button>
      
      <Modal
        title="Request an Invitation"
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={handleRequest}
        confirmLoading={loading}
        okText="Send"
        cancelText="Cancel"
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="email"
            label="Your Email"
            rules={[
              {
                required: true,
                message: 'Please enter your email',
              },
              {
                type: 'email',
                message: 'Please enter a valid email',
              },
            ]}
          >
            <Input 
              type="email" 
              placeholder="Enter your email address"
              autoFocus
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}