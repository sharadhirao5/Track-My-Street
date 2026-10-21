import Navbar from "../components/Navbar";
import "../styles/myComplaints.css";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

function MyComplaints() {
  const complaints = [
    {
      id: "TMS001",
      type: "Pothole",
      location: "Main Road",
      date: "August 11, 2026",
      status: "Pending",
    },
    {
      id: "TMS002",
      type: "Road Crack",
      location: "College Road",
      date: "August 10, 2026",
      status: "In Progress",
    },
    {
      id: "TMS003",
      type: "Waterlogging",
      location: "Market Road",
      date: "August 08, 2026",
      status: "Resolved",
    },
  ];

  return (
    <>
      <Navbar />

      <main className="complaints-page">

        <section className="complaints-header">
          <div>
            <p className="complaints-label">MY COMPLAINTS</p>

            <h1>Reported Road Damage</h1>

            <p>
              View and track all the road damage complaints you have reported.
            </p>
          </div>

          <Link to="/report" className="new-complaint-btn">
            + Report New Damage
          </Link>
        </section>


        <section className="complaints-list">

          {complaints.map((complaint) => (
            <div className="complaint-card" key={complaint.id}>

              <div className="complaint-card-top">

                <div className="complaint-title">

                  <div className="complaint-type-icon">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <h2>{complaint.type}</h2>
                    <p>{complaint.id}</p>
                  </div>

                </div>


                <span
                  className={`complaint-status ${complaint.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {complaint.status}
                </span>

              </div>


              <div className="complaint-card-details">

                <div>
                  <FaMapMarkerAlt />
                  <span>{complaint.location}</span>
                </div>

                <div>
                  <FaClock />
                  <span>{complaint.date}</span>
                </div>

              </div>


              <div className="complaint-card-footer">

                <span>
                  {complaint.status === "Resolved" ? (
                    <>
                      <FaCheckCircle /> Complaint resolved
                    </>
                  ) : (
                    <>
                      <FaClock /> Awaiting further action
                    </>
                  )}
                </span>


                <Link
                  to="/complaint-tracking"
                  className="view-complaint-btn"
                >
                  View Details
                  <FaArrowRight />
                </Link>

              </div>

            </div>
          ))}

        </section>

      </main>
    </>
  );
}

export default MyComplaints;