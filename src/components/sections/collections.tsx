export default function Collection() {
  return (
    <section className="bg-white px-6 py-20 space-y-10">
      {["Kanchipuram Silk", "Banarasi Gold", "Chanderi Grace"].map((name) => (
        <div key={name} className="rounded-3xl bg-whitw p-8 shadow-sm">
          <h3 className="text-2xl font-serif">{name}</h3>
          <p className="mt-2 text-neutral-600">Handcrafted luxury saree</p>
        </div>
      ))}
    </section>
  );
}
