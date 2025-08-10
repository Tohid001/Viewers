export interface ICreateTemplateModal {
  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  studyId: string;
}

export interface ITemplate {
  id: string;
  name: string;
  content: string;
}
