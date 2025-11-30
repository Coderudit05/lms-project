function Input({ label, type = "text", className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block font-medium mb-1">{label}</label>}

      <input
        type={type}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
    </div>
  );
}

export default Input;
