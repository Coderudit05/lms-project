function PageWrapper({ title, children }) {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">{title}</h1>
      {children}
    </div>
  );
}

export default PageWrapper;
