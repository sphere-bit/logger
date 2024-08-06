import { loadSnapshot, useEditor } from 'tldraw';

export default function LoadButton({ documentId, userId }) {
  const editor = useEditor();

  const loadDocumentState = async (documentId) => {
    const data = localStorage.getItem(`document-${documentId}`);
    return data ? JSON.parse(data) : null;
  };

  const loadSessionState = async (documentId, userId) => {
    const data = localStorage.getItem(`session-${documentId}-${userId}`);
    return data ? JSON.parse(data) : null;
  };

  return (
    <button
      onClick={async () => {
        const document = await loadDocumentState(documentId);
        const session = await loadSessionState(documentId, userId);
        if (document && session) {
          editor.setCurrentTool('select'); // Reset tool state separately
          loadSnapshot(editor.store, { document, session });
        } else {
          console.error('Failed to load document or session state');
        }
      }}
    >
      Load
    </button>
  );
}
