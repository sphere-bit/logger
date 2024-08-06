import { ContainsPropertyDataSourceFilterExpressionVisitor } from 'igniteui-react-core';
import { getSnapshot, useEditor } from 'tldraw';

export default function SaveButton({ documentId, userId }) {
  const editor = useEditor();

  const saveDocumentState = async (documentId, document) => {
    console.log(documentId);
    localStorage.setItem(`document-${documentId}`, JSON.stringify(document));
  };

  const saveSessionState = async (documentId, userId, session) => {
    localStorage.setItem(`session-${documentId}-${userId}`, JSON.stringify(session));
  };

  return (
    <button
      onClick={async () => {
        const { document, session } = getSnapshot(editor.store);
        await saveDocumentState(documentId, document);
        await saveSessionState(documentId, userId, session);
      }}
    >
      Save
    </button>
  );
}
