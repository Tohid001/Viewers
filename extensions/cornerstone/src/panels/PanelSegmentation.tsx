'use client';
import React, { useState } from 'react';
import { RichTextEditor } from './components/RichTextEditor';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@ohif/ui-next';

import { useSearchParams } from 'react-router-dom';
import { getStorageKey } from './utils/getStorageKey';
import { useSystem } from '@ohif/core';
import { usePatientInfo } from '@ohif/extension-default';

const formatWithEllipsis = (str, maxLength) => {
  if (str?.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
};

function ReportPanel() {
  const { servicesManager } = useSystem();
  const { patientInfo } = usePatientInfo(servicesManager);
  const formattedPatientName = formatWithEllipsis(patientInfo.PatientName, 27);

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
      <div className={`bg-bkg-med flex w-full items-start gap-4 p-2`}>
        <div className={`bg-bkg-med text-sm`}>
          <p className="font-bold text-gray-500">Patient Name</p>
          <p>{formattedPatientName}</p>
        </div>
        <div className={`bg-bkg-med text-sm`}>
          <p className="font-bold text-gray-500">Birth Gender</p>
          <p>{patientInfo.PatientSex}</p>
        </div>

        <div>
          <div className="text-sm font-bold text-gray-500">Select Report Template:</div>
          <Select
            value={'template 0'}
            onValueChange={() => {}}
          >
            <SelectTrigger className="text-primary h-8 w-36 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="template 0">template 0</SelectItem>
              <SelectItem value="template 1">template 1</SelectItem>
              <SelectItem value="template 2">template 2</SelectItem>
              <SelectItem value="template 3">template 3</SelectItem>
              <SelectItem value="template 4">template 4</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
