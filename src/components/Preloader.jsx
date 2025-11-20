export default function Preloader() {
  return (
    <div className="my-preloader">
      <div className="preloader">
        <div className="preloader__square"></div>
        <div className="preloader__square"></div>
        <div className="preloader__square"></div>
        <div className="preloader__square"></div>
      </div>
      <div className="status">
        Loading<span className="status__dot">.</span>
        <span className="status__dot">.</span>
        <span className="status__dot">.</span>
      </div>
    </div>
  );
}
