import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-light)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg px-4 py-3 bg-white shadow-sm sticky-top">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-primary fw-bold" style={{ fontSize: '1.5rem' }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <i className="bi bi-heart-pulse-fill" />
            </div>
            MediBook
          </Link>
          <div className="d-flex gap-3">
            <Link to="/login" className="btn btn-outline-primary fw-semibold px-4 rounded-pill">Login</Link>
            <Link to="/register" className="btn btn-primary fw-semibold px-4 rounded-pill shadow-sm">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow-1 d-flex align-items-center position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2f4e 50%, #0d6efd22 100%)', color: 'white', padding: '6rem 0' }}>
        {/* Background blobs for premium feel */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(102,16,242,0.3) 0%, rgba(13,110,253,0) 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(13,110,253,0.2) 0%, rgba(13,110,253,0) 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />
        
        <div className="container position-relative z-1">
          <div className="row align-items-center">
            <div className="col-lg-6 text-center text-lg-start mb-5 mb-lg-0">
              <span className="badge bg-primary px-3 py-2 rounded-pill mb-3 fs-6" style={{ background: 'rgba(13,110,253,0.2)' }}>
                <i className="bi bi-star-fill text-warning me-2" /> Top Doctors in the City
              </span>
              <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: 1.2 }}>
                Your Health, <br />
                <span style={{ background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Our Priority.</span>
              </h1>
              <p className="lead mb-5 text-light" style={{ opacity: 0.9, fontSize: '1.25rem' }}>
                Book appointments with the best doctors instantly. Manage your prescriptions, view your health records, and experience hassle-free healthcare.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <Link to="/register" className="btn btn-primary btn-lg px-5 rounded-pill shadow" style={{ fontSize: '1.1rem' }}>
                  Get Started <i className="bi bi-arrow-right ms-2" />
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-5 rounded-pill" style={{ fontSize: '1.1rem' }}>
                  View Demo
                </Link>
              </div>
              <div className="mt-5 d-flex gap-4 justify-content-center justify-content-lg-start text-center">
                <div>
                  <h3 className="fw-bold mb-0">20+</h3>
                  <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Specialists</span>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                <div>
                  <h3 className="fw-bold mb-0">50k+</h3>
                  <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Patients</span>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                <div>
                  <h3 className="fw-bold mb-0">4.9</h3>
                  <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Rating</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6 position-relative">
              <div className="card border-0 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '20px' }}>
                <div className="card-body p-4 p-md-5">
                  <div className="text-center mb-4">
                    <i className="bi bi-shield-check display-1 text-success mb-3" />
                    <h3 className="fw-bold text-white">Verified Doctors</h3>
                    <p className="text-light opacity-75">All our professionals go through a strict vetting process to ensure you get the best care.</p>
                  </div>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                    <li className="d-flex align-items-center gap-3 text-white bg-dark bg-opacity-25 p-3 rounded-3">
                      <i className="bi bi-calendar-check text-primary fs-4" />
                      <span className="fw-medium">Movie-Ticket Style Instant Booking</span>
                    </li>
                    <li className="d-flex align-items-center gap-3 text-white bg-dark bg-opacity-25 p-3 rounded-3">
                      <i className="bi bi-file-earmark-medical text-primary fs-4" />
                      <span className="fw-medium">Digital Prescriptions & Records</span>
                    </li>
                    <li className="d-flex align-items-center gap-3 text-white bg-dark bg-opacity-25 p-3 rounded-3">
                      <i className="bi bi-bell text-primary fs-4" />
                      <span className="fw-medium">Smart Appointment Reminders</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h6 className="text-primary fw-bold text-uppercase tracking-wider">Features</h6>
            <h2 className="fw-bold display-6 text-dark">Why Choose MediBook?</h2>
          </div>
          <div className="row g-4">
            {[
              { icon: 'search', title: 'Find Specialists', desc: 'Search and filter top-rated doctors across 10+ medical specializations with advanced filtering options.' },
              { icon: 'calendar-week', title: 'Interactive Booking', desc: 'Book appointments instantly using our modern 5-day horizon slot picker. Fast and responsive.' },
              { icon: 'shield-lock', title: 'Secure Gateway', desc: 'Robust and reliable payment processing options including Cards, UPI, and Net Banking.' },
              { icon: 'file-earmark-medical', title: 'Digital Prescriptions', desc: 'Access your health records and digital prescriptions instantly from your personal dashboard.' },
              { icon: 'bell', title: 'Smart Reminders', desc: 'Automated 1-day, 1-hour, and 15-minute SMS/Email reminders so you never miss an appointment.' },
              { icon: 'camera-video', title: 'Teleconsultation', desc: 'Connect with premium healthcare professionals from the comfort of your home (Coming Soon).' }
            ].map((feature, idx) => (
              <div key={idx} className="col-md-4 mb-4">
                <div className="card border-0 h-100 text-center shadow-sm" style={{ padding: '2rem', background: 'var(--bg-white)', borderRadius: '20px', transition: 'all 0.3s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-8px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="icon-box mx-auto mb-4" style={{ width: '70px', height: '70px', background: 'var(--bg-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`bi bi-${feature.icon} text-primary fs-2`} />
                  </div>
                  <h5 className="fw-bold mb-3">{feature.title}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Doctors Section */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h6 className="text-primary fw-bold text-uppercase tracking-wider">World Class Professionals</h6>
            <h2 className="fw-bold display-6 text-dark">Meet Our Top Specialists</h2>
            <p className="text-muted mx-auto mt-3" style={{ maxWidth: '600px' }}>Book appointments with renowned medical experts who have decades of experience in their respective fields.</p>
          </div>
          <div className="row g-4">
            {[
              { name: 'Dr. Robert Mao', spec: 'Cardiologist', exp: '47+ Years', hosp: 'Apollo Hospitals', bio: 'Interventional Cardiologist with expertise in Open Heart Surgery and Heart Valve Replacement.' },
              { name: 'Dr. Siddhartha Ghosh', spec: 'Neurologist', exp: '40+ Years', hosp: 'MGM Healthcare', bio: 'Distinguished neurosurgeon with over 20,000 successful neurosurgeries completed.' },
              { name: 'Dr. T.R. Muralidharan', spec: 'Cardiologist', exp: '22+ Years', hosp: 'SRM Global Hospitals', bio: 'Director of Cardiac Sciences, recipient of the Best Doctor Award.' },
              { name: 'Dr. Prithika Chary', spec: 'Neurologist', exp: '35+ Years', hosp: 'Kauvery Hospital', bio: 'The first and only lady in India qualified as both a neurosurgeon and neurophysician.' }
            ].map((doc, idx) => (
              <div key={idx} className="col-md-6 col-lg-3">
                <div className="card border-0 h-100 shadow-sm rounded-4 overflow-hidden" style={{ transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div className="bg-primary text-white d-flex align-items-center justify-content-center pt-4 pb-3" style={{ borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                    <div className="bg-white text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                      {doc.name.charAt(4)}
                    </div>
                  </div>
                  <div className="card-body text-center pt-4 px-4 pb-4">
                    <h5 className="fw-bold mb-1">{doc.name}</h5>
                    <div className="text-primary fw-medium small mb-3">{doc.spec} • {doc.exp}</div>
                    <div className="text-muted small mb-3"><i className="bi bi-hospital me-1" />{doc.hosp}</div>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{doc.bio}</p>
                  </div>
                  <div className="card-footer bg-white border-0 text-center pb-4 pt-0">
                    <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-4">Book Now</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-dark text-light py-4 text-center">
        <div className="container">
          <p className="mb-0 opacity-75">&copy; 2026 MediBook Platform. Designed for excellence.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
