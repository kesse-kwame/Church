// simple incremental ID generator stored in localStorage
// format: CH-YYYY-XXXX (zero-padded)
const KEY = "church_member_id_counters_v1";

function _read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function _write(obj) {
  localStorage.setItem(KEY, JSON.stringify(obj));
}

function generate() {
  const now = new Date();
  const year = now.getFullYear();
  const counters = _read();
  counters[year] = (counters[year] || 0) + 1;
  _write(counters);
  const seq = String(counters[year]).padStart(4, "0");
  return `CH-${year}-${seq}`;
}

export default { generate };