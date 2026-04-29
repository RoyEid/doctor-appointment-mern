import { Link } from "react-router-dom";

function CallToAction() {
  return (
    <section className="bg-[#ddfcff] text-black py-16">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h3 className="text-3xl font-bold mb-4">
          {" "}
          In an emergency? Need help now?
        </h3>
        <p className="mt-2 mb-2">
          Our team is available 24/7 to provide urgent care and immediate
          medical assistance whenever you need it most
        </p>

        <Link
          to="/add-appointment"
          className="mt-2 inline-block rounded bg-[#008e9b] text-white py-3 px-6 hover:bg-[#007a85]"
        >
          Make An Appointment
        </Link>
      </div>
    </section>
  );
}

export default CallToAction;
