import "./Stats.css";

function Stats() {
  return (
    <section className="stats-section">

      <div className="stat">
        <div className="stat-icon">💼</div>

        <div>
          <h3>10K+</h3>
          <p>Jobs Available</p>
        </div>
      </div>


      <div className="stat">
        <div className="stat-icon">▦</div>

        <div>
          <h3>5K+</h3>
          <p>Companies</p>
        </div>
      </div>


      <div className="stat">
        <div className="stat-icon">♙</div>

        <div>
          <h3>20K+</h3>
          <p>Active Users</p>
        </div>
      </div>


      <div className="stat">
        <div className="stat-icon">▣</div>

        <div>
          <h3>100K+</h3>
          <p>Applications</p>
        </div>
      </div>

    </section>
  );
}

export default Stats;