export type File = {
    fileName: string;
    code: string;
    language: string;
  };
  
  export interface Files {
    source: File[];
    template: File[];
    solution: File[];
  }
  
  // Course and lesson related types
  export type Author = {
    name: string;
    url: string;
  };
  
  export type Module = {
    id: string;
    index: number;
    title: string;
    description: any; // MDXRemoteSerializeResult
    numOfLessons: number;
  };
  
  export interface NavLink {
    name: string;
    href: string;
  }
  
  export interface UserDetailProps {
    name?: string;
    image?: string;
    email?: string;
  }
  
  // Component props types
  export interface SectionProps {
    courseId: string;
    section: {
      sectionIndex: number;
      title: string;
      lessons: any[];
    };
    current: string;
    isActive: boolean;
  }
  
  export interface BottomNavbarProps {
    doesMatch?: boolean;
    isOpen?: boolean;
    courseId: string;
    lessonId: string;
    chapterId: string;
    current: string;
    prev?: string;
    next?: string;
    sections: any[];
    toggleAnswer?: () => void;
    runTests?: () => void;
  }
  
  export interface EditorTabsProps {
    showHints: boolean;
    isAnswerOpen: boolean;
    readOnly?: boolean;
    incorrectFiles: File[];
    solution: File[];
    editorContent: File[];
    isOpen: boolean;
    tabIndex: number;
    showDiff: boolean;
    setShowDiff: (showDiff: boolean) => void;
    setTabIndex: (index: number) => void;
    onOpen: () => void;
    onClose: () => void;
    setEditorContent: (newEditorContent: File[]) => void;
  }
  
  export interface FullscreenEditorModalProps {
    isOpen: boolean;
    editorProps: EditorTabsProps;
  }
  
  export interface NavbarProps {
    navLinks?: NavLink[];
    cta?: boolean;
    isLessonInterface?: boolean;
    lessonDetails?: {
      courseId: string;
      lessonId: string;
      chapterId: string;
      chapters: any[];
      githubUrl: string;
    };
  }
  
  export interface CoursePageProps {
    slug: string;
    title: string;
    author: Author;
    description: string;
    modules: Module[];
    tags: { language: string; level: string };
  }
  
  export interface ModuleProps {
    module: Module;
    slug: string;
  }
  
  export interface CourseModuleProps {
    courseId: string;
    lessonId: string;
    chapterId: string;
    mdxSource: any; // MDXRemoteSerializeResult
    files: Files;
    current: string;
    prev: string;
    next: string;
    chapters: any[];
    sections: any[];
    githubUrl: string;
  }
  
  export interface ModuleListProps {
    modules: Module[];
  }
  
  export interface FeatureComponentProps {
    title: string | JSX.Element;
    description: string | JSX.Element;
    image: string;
    alt?: string;
    isImageFirst?: boolean;
    cta?: JSX.Element;
  }
  
  export interface SuccessPageProps {
    slug: string;
    course: string;
    lesson: string;
    totalLessonsInCourse: number;
  }
  
  export interface SolutionPanelProps {
    isOpen: boolean;
    onClose: () => void;
    userCode: File[];
    solutionCode: File[];
    hints: string[];
    explanations?: Record<string, string>; // Explanations for specific files
  }
  
  export interface CourseOnboardingProps {
    courseTitle: string;
  }

  export interface OnboardingStep {
    title: string;
    description: string;
    icon: React.ReactElement;
    image?: string;
  }

  export interface Course {
    slug: string;
    title: string;
    level: string;
    language: string;
    description: string;
  }
  export interface LottieProps {
    options: {
      animationData: any;
      [key: string]: any;
    };
    height?: number;
    width?: number;
    isStopped?: boolean;
    isPaused?: boolean;
    isClickToPauseDisabled?: boolean;
    speed?: number;
    segments?: number[] | [number, number][];
    direction?: 1 | -1;
    ariaRole?: string;
    ariaLabel?: string;
    eventListeners?: any[];
    style?: React.CSSProperties;
  }