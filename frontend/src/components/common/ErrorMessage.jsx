export default function ErrorMessage({ message }) {
  return (
    <div className="py-20 text-center">

      <h2 className="text-2xl font-bold text-red-600">
        {message}
      </h2>

    </div>
  );
}