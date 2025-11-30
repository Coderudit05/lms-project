function TextArea({ label, rows = 4, className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block font-medium mb-1">{label}</label>}

      <textarea
        rows={rows}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      ></textarea>
    </div>
  );
}

export default TextArea;
