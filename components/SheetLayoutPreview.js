import FullSheetLayoutPreview from "./FullSheetLayoutPreview";

export default function SheetLayoutPreview({ calc, title = "Sheet Layout Preview" }) {
  return <FullSheetLayoutPreview calc={calc} sheetW={48} sheetH={96} title={title} />;
}
