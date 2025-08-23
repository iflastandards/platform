import React, { useState } from 'react';
import { Drawer, Tabs, Button, Tooltip, Tour, FloatButton, Input } from 'antd';
import { QuestionCircleOutlined, BookOutlined, PlayCircleOutlined, ApiOutlined, SearchOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { useFeatureDocs } from '@/hooks/useFeatureDocs';

interface FeatureHelpProps {
  feature: string;
  children?: React.ReactNode;
}

export const FeatureHelp: React.FC<FeatureHelpProps> = ({ feature, children }) => {
  const [open, setOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const { docs, tutorials, tooltips, loading } = useFeatureDocs(feature);

  return (
    <>
      {children}
      
      {/* Floating Help Button */}
      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setOpen(true)}
        tooltip="Help & Documentation"
      />

      {/* Help Drawer */}
      <Drawer
        title={`Help: ${feature}`}
        placement="right"
        width={600}
        onClose={() => setOpen(false)}
        open={open}
        extra={
          <Button
            icon={<PlayCircleOutlined />}
            onClick={() => {
              setOpen(false);
              setTourOpen(true);
            }}
          >
            Start Tour
          </Button>
        }
      >
        <Tabs
          defaultActiveKey="quick"
          items={[
            {
              key: 'quick',
              label: (
                <span>
                  <BookOutlined /> Quick Help
                </span>
              ),
              children: <QuickHelp tooltips={tooltips} />,
            },
            {
              key: 'guide',
              label: 'User Guide',
              children: <UserGuide content={docs?.userGuide} />,
            },
            {
              key: 'tutorials',
              label: 'Tutorials',
              children: <Tutorials items={tutorials?.items} />,
            },
            {
              key: 'api',
              label: (
                <span>
                  <ApiOutlined /> API Docs
                </span>
              ),
              children: <ApiDocs content={docs?.api} />,
            },
          ]}
        />
      </Drawer>

      {/* Guided Tour */}
      <Tour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        steps={tutorials?.tour?.map(step => ({
          ...step,
          target: () => document.querySelector(step.target) as HTMLElement
        })) || []}
      />
    </>
  );
};

// Sub-components
const QuickHelp: React.FC<{ tooltips: any }> = ({ tooltips }) => (
  <div className="space-y-4">
    <Input.Search
      placeholder="Search help topics..."
      prefix={<SearchOutlined />}
      allowClear
    />
    <div className="space-y-2">
      {tooltips?.map((tip: any) => (
        <div key={tip.id} className="p-3 border rounded">
          <h4 className="font-semibold">{tip.title}</h4>
          <p className="text-gray-600">{tip.content}</p>
        </div>
      ))}
    </div>
  </div>
);

const UserGuide: React.FC<{ content?: string }> = ({ content }) => (
  <div className="prose max-w-none">
    <ReactMarkdown>{content || 'Loading user guide...'}</ReactMarkdown>
  </div>
);

const Tutorials: React.FC<{ items?: any[] }> = ({ items }) => (
  <div className="space-y-4">
    {items?.map((tutorial) => (
      <div key={tutorial.id} className="p-4 border rounded hover:shadow-md cursor-pointer">
        <h3 className="font-semibold">{tutorial.title}</h3>
        <p className="text-gray-600">{tutorial.description}</p>
        <div className="mt-2 text-sm text-blue-600">
          {tutorial.duration} • {tutorial.level}
        </div>
      </div>
    ))}
  </div>
);

const ApiDocs: React.FC<{ content?: string }> = ({ content }) => (
  <div className="prose max-w-none">
    <ReactMarkdown>{content || 'Loading API documentation...'}</ReactMarkdown>
  </div>
);

// Field-level help tooltip component
export const HelpTooltip: React.FC<{ field: string; children: React.ReactNode }> = ({ 
  field, 
  children 
}) => {
  const { getFieldHelp } = useFeatureDocs();
  const help = getFieldHelp(field);
  
  return (
    <Tooltip title={help} placement="top">
      <span style={{ cursor: 'help' }}>{children}</span>
    </Tooltip>
  );
};