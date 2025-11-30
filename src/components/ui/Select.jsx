function Select({ label, options = [], className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block font-medium mb-1">{label}</label>}

      <select
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      >
        <option value="">Select option</option>

        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;
