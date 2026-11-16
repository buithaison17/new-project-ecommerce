declare module '@ckeditor/ckeditor5-react' {
    import * as React from 'react';
    export interface CKEditorProps {
        editor: any;
        data?: string;
        config?: Record<string, any>;
        disabled?: boolean;
        onReady?: (editor: any) => void;
        onChange?: (event: any, editor: any) => void;
        onBlur?: (event: any, editor: any) => void;
        onFocus?: (event: any, editor: any) => void;
        onError?: (error: any, details: any) => void;
    }
    export class CKEditor extends React.Component<CKEditorProps> {}
}

declare module '@ckeditor/ckeditor5-build-classic' {
    const ClassicEditor: any;
    export default ClassicEditor;
}

