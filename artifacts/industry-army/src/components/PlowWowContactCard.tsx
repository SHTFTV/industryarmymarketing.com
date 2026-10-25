import "./PlowWowContactCard.css";

export default function PlowWowContactCard() {
  return <details className="pw-contact" open>
    <summary>Talk to PlowWow™ <span aria-hidden="true">↗</span></summary>
    <aside aria-label="PlowWow snow removal contact card">
      <img className="pw-card-wow" src="https://www.plowwow.com/wow-mascot.png" width={44} height={52} alt="Wow, the PlowWow mascot" /><p className="pw-card-kicker">SNOW &amp; ICE · FIRST-YEAR BETA</p>
      <h2>PlowWow™</h2>
      <p>Ask about snow services and the Snow Intelligence beta.</p>
      <div className="pw-card-actions"><a href="tel:+16047611518">Call 604-761-1518</a><a href="sms:+16047611518">Text PlowWow</a></div>
      <a href="mailto:wow@plowwow.com?subject=PlowWow%20Snow%20Intelligence%20enquiry">wow@plowwow.com</a>
      <a href="https://www.plowwow.com/intelligence">Explore the beta →</a>
      <small>Route capacity, price, scope and timing are confirmed in your agreement.</small>
    </aside>
  </details>;
}
