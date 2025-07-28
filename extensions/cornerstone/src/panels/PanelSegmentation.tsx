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
// import { useReactToPrint } from 'react-to-print';
// import html2pdf from 'html2pdf.js';
import buetLogo from '../assets/images/buetLogo.png';

const formatWithEllipsis = (str, maxLength) => {
  if (str?.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
};

function ReportPanel() {
  const { servicesManager } = useSystem();
  const componentRef = React.useRef<HTMLDivElement | null>(null);
  const { patientInfo } = usePatientInfo(servicesManager);
  const formattedPatientName = formatWithEllipsis(patientInfo.PatientName, 27);

  const [isEditable, setIsEditable] = useState(false);
  const [searchParams] = useSearchParams();
  const studyId = searchParams.get('StudyInstanceUIDs');
  const storageKey = getStorageKey(studyId);
  const [content, setContent] = useState(localStorage.getItem(getStorageKey(studyId)));

  const handleDownload = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      if (!componentRef.current) {
        toast.error('No content to download');
        return;
      }

      const element = componentRef.current;

      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: element.offsetHeight,
        windowWidth: 794,
        windowHeight: element.offsetHeight,
      });

      element.style.display = 'none';
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const filename = `${formattedPatientName || 'medical_report'}.pdf`;
      pdf.save(filename);

      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF. Please try the print option instead.');
    }
  };

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

      <div
        ref={componentRef}
        style={{ display: 'none' }}
      >
        <div
          style={{
            width: '794px',
            padding: '40px',
            backgroundColor: 'white',
            fontFamily: 'Arial, sans-serif',
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'black',
            boxSizing: 'border-box',
          }}
        >
          <div className="flex items-center">
            <div className="self-start">
              <img
                src={buetLogo}
                width={75}
                height={75}
              />
            </div>

            <div
              style={{
                textAlign: 'center',
                flexBasis: '100%',
                marginBottom: '30px',
                borderBottom: '2px solid black',
                paddingBottom: '20px',
              }}
            >
              <h1
                style={{
                  margin: '0 0 10px 0',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'black',
                }}
              >
                BUET Medical Center
              </h1>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '15px',
                color: 'black',
                borderBottom: '1px solid #ddd',
                paddingBottom: '5px',
              }}
            >
              Patient Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <strong>Patient Name:</strong> {patientInfo.PatientName || 'N/A'}
              </div>
              <div>
                <strong>Birth Gender:</strong> {patientInfo.PatientSex || 'N/A'}
              </div>
              <div>
                <strong>Study ID:</strong> {studyId || 'N/A'}
              </div>
              <div>
                <strong>Patient ID:</strong> {patientInfo.PatientID || 'N/A'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: 'black',
                borderBottom: '1px solid #ddd',
                paddingBottom: '5px',
              }}
            >
              Report Content
            </h2>
            <div>
              {content ? (
                <div
                  className="prose"
                  style={{
                    minHeight: '200px',
                    border: '1px solid #ddd',
                    padding: '15px',
                    backgroundColor: '#ffffff',
                    maxWidth: '100%',
                  }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <p style={{ fontStyle: 'italic', color: '#999' }}>No report content available</p>
              )}

              {/* Inline TipTap Styles for PDF */}
            </div>
          </div>

          <div
            style={{
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid #ddd',
              fontSize: '12px',
              color: '#666',
            }}
          >
            <p>
              This report was generated automatically. Please verify all information before use.
            </p>
          </div>
        </div>
      </div>

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
                handleDownload();
              }}
            >
              Download PDF
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
