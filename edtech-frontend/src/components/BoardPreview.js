export default function BoardPreview({ title }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
    </div>
  );
}
