/* eslint-disable react/display-name */
/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { RichTextEditor } from './components/RichTextEditor';
import {
  Button,
  Input,
  Label,
  Modal,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  toast,
} from '@ohif/ui-next';

import { useSearchParams } from 'react-router-dom';
import { getReportContentKey, getTemplateStorageKey } from './utils/getStorageKey';
import { useSystem } from '@ohif/core';
import { usePatientInfo } from '@ohif/extension-default';
// import { useReactToPrint } from 'react-to-print';
// import html2pdf from 'html2pdf.js';
import buetLogo from '../assets/images/buetLogo.png';
import { uuidv4 } from '@cornerstonejs/core/utilities';
import { ICreateTemplateModal, ITemplate } from './ReportPanel.types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formatWithEllipsis = (str, maxLength) => {
  if (str?.length > maxLength) {
    return str.substring(0, maxLength) + '...';
  }
  return str;
};

/*
TODO:  Will handle the ellipsis for select template menu later
 */

function ReportPanel() {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ITemplate | null>(null);

  const { servicesManager } = useSystem();
  const componentRef = React.useRef<HTMLDivElement | null>(null);
  const { patientInfo } = usePatientInfo(servicesManager);
  const formattedPatientName = formatWithEllipsis(patientInfo.PatientName, 27);

  const [isEditable, setIsEditable] = useState(false);
  const [searchParams] = useSearchParams();
  const studyId = searchParams.get('StudyInstanceUIDs');
  const storageKey = getReportContentKey(studyId);
  const templates = JSON.parse(localStorage.getItem(getTemplateStorageKey(studyId)) || '[]');
  const [content, setContent] = useState(localStorage.getItem(getReportContentKey(studyId)));

  const [isFooterOutOfView, setIsFooterOutOfView] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    const footerElement = footerRef.current;
    if (!footerElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterOutOfView(entry.intersectionRatio < 1);
      },
      {
        root: null,

        rootMargin: '0px',

        threshold: 1,
      }
    );

    observer.observe(footerElement);

    return () => {
      observer.disconnect();
    };
  }, []);

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
    <div
      className={`flex h-full w-full flex-col gap-4 pr-3 pl-2 ${isFooterOutOfView ? 'pb-[2.6rem]' : ''}`}
    >
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
            value={selectedTemplate?.id || ''}
            onValueChange={id => {
              const template = templates.find((template: ITemplate) => template.id === id);
              if (template) {
                setSelectedTemplate(template);
                setContent(template.content);
              }
            }}
            open={isSelectOpen}
            onOpenChange={setIsSelectOpen}
          >
            <SelectTrigger className="text-primary max-w-36 h-8 truncate bg-white text-sm">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent className="max-w-48">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setIsTemplateModalOpen(true);
                  setIsSelectOpen(false);
                }}
              >
                + Create New Template
              </Button>

              {!!templates.length &&
                templates.map((template, index) => {
                  return (
                    <SelectItem
                      key={template.id}
                      value={template.id}
                    >
                      <div className="max-w-48 truncate pr-5">
                        {formatWithEllipsis(template.name, 194)}
                      </div>
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <RichTextEditor
        key={selectedTemplate?.id}
        content={content}
        onChange={value => setContent(value)}
        placeholder="Start writing your report here..."
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

      <div
        ref={footerRef}
        className={`bg-bkg-med flex w-full gap-8 p-2`}
      >
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

      <ReportPanel.CreateTemplateModal
        isTemplateModalOpen={isTemplateModalOpen}
        setIsTemplateModalOpen={setIsTemplateModalOpen}
        studyId={studyId}
      />
    </div>
  );
}

ReportPanel.CreateTemplateModal = ({
  isTemplateModalOpen,
  setIsTemplateModalOpen,
  studyId,
}: ICreateTemplateModal) => {
  const isContentEmpty = (htmlContent: string): boolean => {
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    return textContent.length === 0;
  };

  const templateSchema = z.object({
    name: z
      .string()
      .min(1, 'Template name is required')
      .min(3, 'Template name must be at least 3 characters')
      .max(50, 'Template name must be less than 50 characters')
      .regex(
        /^[a-zA-Z0-9\s\-_]+$/,
        'Template name can only contain letters, numbers, spaces, hyphens, and underscores'
      ),
    content: z
      .string()
      .min(1, 'Template content is required')
      .refine(content => !isContentEmpty(content), {
        message: 'Template content cannot be empty',
      }),
  });

  type TemplateFormData = z.infer<typeof templateSchema>;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      content: '',
    },
    mode: 'onTouched',
  });

  const contentValue = watch('content');

  const onSubmit = async (data: TemplateFormData): Promise<void> => {
    try {
      if (isContentEmpty(data.content)) {
        toast.error('Template content cannot be empty');
        return;
      }

      const templates = JSON.parse(localStorage.getItem(templateStorageKey) || '[]') as ITemplate[];

      const nameExists = templates.some(
        template => template.name.toLowerCase() === data.name.toLowerCase()
      );

      if (nameExists) {
        toast.error('A template with this name already exists!');
        return;
      }

      const payload: ITemplate = {
        id: uuidv4(),
        name: data.name,
        content: data.content,
      };

      templates.push(payload);
      localStorage.setItem(templateStorageKey, JSON.stringify(templates));
      toast.success('Template created successfully!', { duration: 1000 });

      handleClose();
    } catch (error) {
      toast.error('Failed to create template. Please try again.');
      console.error('Error creating template:', error);
    }
  };

  const handleContentChange = (value: string) => {
    setValue('content', value, {
      shouldValidate: touchedFields.content,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const templateStorageKey = getTemplateStorageKey(studyId);

  const handleClose = () => {
    setIsTemplateModalOpen(false);
    reset();
  };

  return (
    <Modal
      containerClassName="max-w-3xl"
      shouldCloseOnEsc={true}
      isOpen={isTemplateModalOpen}
      title={'Create New Report Template'}
      onClose={handleClose}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-[80vh] flex-col gap-3"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name: </Label>
          <Input
            id="name"
            placeholder="Enter Template Name"
            type="text"
            {...register('name')}
            className={errors.name && touchedFields.name ? 'border-red-500' : ''}
          />
          {errors.name && touchedFields.name && (
            <span className="text-sm text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <Label>Content: </Label>
          <div className="flex flex-1 flex-col">
            <RichTextEditor
              content={contentValue}
              onChange={handleContentChange}
              placeholder="Start writing your report here..."
              isEditable={true}
            />
          </div>
          {errors.content && touchedFields.content && (
            <span className="text-sm text-red-500">{errors.content.message}</span>
          )}
        </div>

        <div className="bg-bkg-med flex w-full justify-end gap-8 p-2">
          <Button
            type="button"
            size="lg"
            variant="destructive"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            variant="default"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReportPanel;
