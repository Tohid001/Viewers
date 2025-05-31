'use client';
import React, { useState } from 'react';
import { RichTextEditor } from './components/RichTextEditor';
import { Button, toast } from '@ohif/ui-next';

import { useSearchParams } from 'react-router-dom';
import { getStorageKey } from './utils/getStorageKey';

function ReportPanel() {
  const [isEditable, setIsEditable] = useState(false);
  const [searchParams] = useSearchParams();
  const studyId = searchParams.get('StudyInstanceUIDs');
  const storageKey = getStorageKey(studyId);
  const [content, setContent] = useState(localStorage.getItem(getStorageKey(studyId)));

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    localStorage.setItem(storageKey, content);
    toast.success('Report saved successfully!', { duration: 200 });
    setIsEditable(false);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 pr-3 pl-2">
      <div className={`bg-bkg-med flex w-full gap-8 p-2`}>
        <Button
          size="lg"
          variant="outline"
          className="basis-1/2"
          onClick={e => {
            e.stopPropagation();
          }}
        >
          Edit Report
        </Button>
        <Button
          size="lg"
          variant="default"
          className="basis-1/2"
          onClick={e => {
            e.stopPropagation();
          }}
        >
          Download Report
        </Button>
      </div>

      <RichTextEditor
        content={content}
        onChange={value => setContent(value)}
        placeholder="Start writing your report here..."
        className="W-full flex-1"
        isEditable={isEditable}
      />

      <div className={`bg-bkg-med flex w-full gap-8 p-2`}>
        {!isEditable ? (
          <>
            <Button
              size="lg"
              variant="outline"
              className="basis-1/2"
              onClick={e => {
                e.stopPropagation();
                setIsEditable(true);
              }}
            >
              Edit Report
            </Button>
            <Button
              size="lg"
              variant="default"
              className="basis-1/2"
              onClick={e => {
                e.stopPropagation();
              }}
            >
              Download Report
            </Button>
          </>
        ) : (
          <>
            <Button
              size="lg"
              variant="destructive"
              className="basis-1/2"
              onClick={e => {
                e.stopPropagation();
                setIsEditable(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              variant="default"
              className="basis-1/2"
              onClick={handleSave}
            >
              Save
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportPanel;
