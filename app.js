/* ============================================================
   GRC Suite — app.js
   Durum yönetimi, görünüm yönlendirme ve modül mantığı
   ============================================================ */

"use strict";

/* ---------------- Durum ve kalıcılık ---------------- */

const STORAGE_KEY = "grcSuiteData_v1";

const emptyState = () => ({
  org: { name: "BOTD Yazılım" },
  soa: { iso27001: {}, iso27701: {}, iso42001: {} },
  assets: [],
  risks: [],
  audits: [],
  findings: [],
  actions: [],
  documents: [],
  kpis: []
});

let state = loadState();
let currentView = "dashboard";
let soaActiveStandard = "iso27001";
let soaSearch = "";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return Object.assign(emptyState(), parsed);
  } catch (e) {
    console.error("Veri okunamadı, boş durumla başlatılıyor:", e);
    return emptyState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    toast("Veri kaydedilemedi: tarayıcı depolaması kullanılamıyor olabilir.");
  }
}

/* ---------------- Yardımcılar ---------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function nextId(prefix, list) {
  const nums = list
    .map(x => parseInt(String(x.id).split("-")[1], 10))
    .filter(n => !isNaN(n));
  const n = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { t.hidden = true; }, 2600);
}

function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return (y && m && d) ? `${d}.${m}.${y}` : iso;
}

function badge(text, color) {
  return `<span class="badge ${color}">${esc(text)}</span>`;
}

function statusBadgeColor(status, map) {
  return map[status] || "gray";
}

const RISK_LEVELS = [
  { max: 4,  label: "Düşük",  cls: "mx-low",      color: "ok" },
  { max: 9,  label: "Orta",   cls: "mx-med",      color: "warn" },
  { max: 16, label: "Yüksek", cls: "mx-high",     color: "warn" },
  { max: 25, label: "Kritik", cls: "mx-critical", color: "bad" }
];

function riskLevel(score) {
  return RISK_LEVELS.find(l => score <= l.max) || RISK_LEVELS[RISK_LEVELS.length - 1];
}

function soaEntry(stdId, ctrlId) {
  if (!state.soa[stdId]) state.soa[stdId] = {};
  if (!state.soa[stdId][ctrlId]) {
    state.soa[stdId][ctrlId] = { applicable: true, status: "uygulanmadi", justification: "" };
  }
  return state.soa[stdId][ctrlId];
}

function soaStats(stdId) {
  const controls = CONTROL_SETS[stdId];
  const entries = state.soa[stdId] || {};
  let applicable = 0, done = 0, partial = 0, planned = 0, notDone = 0, excluded = 0;
  controls.forEach(c => {
    const e = entries[c.id];
    if (e && e.applicable === false) { excluded++; return; }
    applicable++;
    const s = e ? e.status : "uygulanmadi";
    if (s === "uygulandi") done++;
    else if (s === "kismen") partial++;
    else if (s === "planlandi") planned++;
    else notDone++;
  });
  const pct = applicable ? Math.round(((done + partial * 0.5) / applicable) * 100) : 0;
  return { total: controls.length, applicable, done, partial, planned, notDone, excluded, pct };
}

/* ---------------- Modal sistemi ---------------- */

function openModal({ title, bodyHTML, onSave, saveLabel = "Kaydet", danger = null }) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHTML;

  const foot = $("#modalFoot");
  foot.innerHTML = "";

  if (danger) {
    const delBtn = document.createElement("button");
    delBtn.className = "btn danger";
    delBtn.textContent = danger.label;
    delBtn.addEventListener("click", () => { danger.onClick(); closeModal(); });
    foot.appendChild(delBtn);
    const spacer = document.createElement("div");
    spacer.style.flex = "1";
    foot.appendChild(spacer);
  }

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn";
  cancelBtn.textContent = "Vazgeç";
  cancelBtn.addEventListener("click", closeModal);
  foot.appendChild(cancelBtn);

  if (onSave) {
    const saveBtn = document.createElement("button");
    saveBtn.className = "btn primary";
    saveBtn.textContent = saveLabel;
    saveBtn.addEventListener("click", () => {
      const ok = onSave();
      if (ok !== false) closeModal();
    });
    foot.appendChild(saveBtn);
  }

  $("#modalBackdrop").hidden = false;
}

function closeModal() {
  $("#modalBackdrop").hidden = true;
}

function fieldHTML(id, label, type = "text", value = "", opts = {}) {
  const v = esc(value);
  if (type === "select") {
    const options = (opts.options || [])
      .map(o => {
        const val = typeof o === "object" ? o.id : o;
        const lab = typeof o === "object" ? o.label : o;
        const sel = String(val) === String(value) ? "selected" : "";
        return `<option value="${esc(val)}" ${sel}>${esc(lab)}</option>`;
      }).join("");
    return `<div class="field"><label for="${id}">${esc(label)}</label><select id="${id}">${options}</select></div>`;
  }
  if (type === "textarea") {
    return `<div class="field"><label for="${id}">${esc(label)}</label><textarea id="${id}">${v}</textarea></div>`;
  }
  return `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" type="${type}" value="${v}" ${opts.attrs || ""}></div>`;
}

/* ---------------- Yönlendirme ---------------- */

const VIEWS = {
  dashboard: { title: "Kontrol Paneli", render: renderDashboard },
  soa:       { title: "Uygulanabilirlik Bildirgesi (SOA)", render: renderSOA },
  assets:    { title: "Varlık Yönetimi", render: renderAssets },
  risks:     { title: "Risk Yönetimi", render: renderRisks },
  audits:    { title: "İç Denetimler", render: renderAudits },
  actions:   { title: "Düzeltici Aksiyonlar (DÖF)", render: renderActions },
  documents: { title: "Doküman Yönetimi", render: renderDocuments },
  kpis:      { title: "Performans Göstergeleri (KPI)", render: renderKPIs },
  settings:  { title: "Veri ve Ayarlar", render: renderSettings }
};

function navigate(view) {
  currentView = view;
  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  $("#pageTitle").textContent = VIEWS[view].title;
  $("#sidebar").classList.remove("open");
  render();
}

function render() {
  $("#content").innerHTML = "";
  VIEWS[currentView].render($("#content"));
  $("#orgChip").textContent = state.org.name;
  $("#footOrg").textContent = state.org.name;
}

/* ============================================================
   GÖRÜNÜM: Kontrol Paneli
   ============================================================ */

function renderDashboard(root) {
  const openActions = state.actions.filter(a => a.status !== "Kapatıldı").length;
  const overdue = state.actions.filter(a =>
    a.status !== "Kapatıldı" && a.due && a.due < new Date().toISOString().slice(0, 10)
  ).length;
  const openFindings = state.findings.filter(f => f.status === "Açık").length;
  const highRisks = state.risks.filter(r =>
    riskLevel(r.likelihood * r.impact).label === "Yüksek" ||
    riskLevel(r.likelihood * r.impact).label === "Kritik"
  ).length;

  // Standart kartları
  const stdCards = Object.values(STANDARDS).map(std => {
    const s = soaStats(std.id);
    const color = s.pct >= 75 ? "var(--ok)" : s.pct >= 40 ? "var(--accent)" : "var(--warn)";
    return `
      <div class="card std-card">
        <div class="donut" style="--pct:${s.pct}; --donut-color:${color}">
          <span>%${s.pct}</span>
        </div>
        <div class="std-meta">
          <div class="std-name">${esc(std.name)}</div>
          <div class="std-code">${esc(std.code)}</div>
          <div class="std-line">
            <strong>${s.applicable}</strong> uygulanabilir kontrol ·
            <strong>${s.done}</strong> uygulandı · <strong>${s.partial}</strong> kısmen
          </div>
        </div>
      </div>`;
  }).join("");

  // Varlık sınıflandırma dağılımı
  const clsCounts = CLASSIFICATIONS.map(c => ({
    label: c,
    count: state.assets.filter(a => a.classification === c).length
  }));
  const maxCls = Math.max(1, ...clsCounts.map(c => c.count));

  // Risk seviye dağılımı
  const lvlCounts = RISK_LEVELS.map(l => ({
    label: l.label,
    count: state.risks.filter(r => riskLevel(r.likelihood * r.impact).label === l.label).length
  }));
  const maxLvl = Math.max(1, ...lvlCounts.map(l => l.count));

  const emptyHint = (state.assets.length + state.risks.length + state.actions.length) === 0
    ? `<div class="card" style="margin-top:16px">
         <h3>Buradan başlayın</h3>
         <p class="card-sub">Henüz kayıt yok. Modülleri tek tek doldurabilir veya platformu hızlıca görmek için örnek veri yükleyebilirsiniz.</p>
         <button class="btn primary" id="seedFromDash">Örnek veri yükle</button>
       </div>` : "";

  root.innerHTML = `
    <div class="view-head">
      <p>Hoş geldiniz, <strong>${esc(state.org.name)}</strong> — üç yönetim sistemi standardının güncel uyum durumu aşağıdadır.</p>
    </div>

    <div class="grid grid-3">${stdCards}</div>

    <div class="stat-tiles">
      <div class="stat-tile"><div class="st-num">${state.assets.length}</div><div class="st-label">Kayıtlı varlık</div></div>
      <div class="stat-tile ${highRisks ? "alert" : ""}"><div class="st-num">${highRisks}</div><div class="st-label">Yüksek / kritik risk</div></div>
      <div class="stat-tile ${overdue ? "alert" : ""}"><div class="st-num">${openActions}</div><div class="st-label">Açık aksiyon (${overdue} gecikmiş)</div></div>
      <div class="stat-tile ${openFindings ? "alert" : ""}"><div class="st-num">${openFindings}</div><div class="st-label">Açık denetim bulgusu</div></div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <h3>Risk seviyesi dağılımı</h3>
        <p class="card-sub">Risk skoru (olasılık × etki) seviyelerine göre kayıt sayısı</p>
        <div class="dist-bars">
          ${lvlCounts.map(l => `
            <div class="dist-row">
              <span>${esc(l.label)}</span>
              <div class="dist-track"><div class="dist-fill" style="width:${(l.count / maxLvl) * 100}%"></div></div>
              <strong>${l.count}</strong>
            </div>`).join("")}
        </div>
      </div>
      <div class="card">
        <h3>Varlık sınıflandırması</h3>
        <p class="card-sub">Gizlilik sınıfına göre varlık dağılımı</p>
        <div class="dist-bars">
          ${clsCounts.map(c => `
            <div class="dist-row">
              <span>${esc(c.label)}</span>
              <div class="dist-track"><div class="dist-fill" style="width:${(c.count / maxCls) * 100}%"></div></div>
              <strong>${c.count}</strong>
            </div>`).join("")}
        </div>
      </div>
    </div>
    ${emptyHint}
  `;

  const seedBtn = $("#seedFromDash", root);
  if (seedBtn) seedBtn.addEventListener("click", loadSeedData);
}

/* ============================================================
   GÖRÜNÜM: SOA
   ============================================================ */

function renderSOA(root) {
  const std = STANDARDS[soaActiveStandard];
  const controls = CONTROL_SETS[soaActiveStandard];
  const stats = soaStats(soaActiveStandard);

  const tabs = Object.values(STANDARDS).map(s =>
    `<button class="tab ${s.id === soaActiveStandard ? "active" : ""}" data-std="${s.id}">${esc(s.name)}</button>`
  ).join("");

  const q = soaSearch.trim().toLowerCase();
  const filtered = q
    ? controls.filter(c => c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.theme.toLowerCase().includes(q))
    : controls;

  let rows = "";
  let lastTheme = null;
  filtered.forEach(c => {
    if (c.theme !== lastTheme) {
      rows += `<tr class="theme-row"><td colspan="5">${esc(c.theme)}</td></tr>`;
      lastTheme = c.theme;
    }
    const e = (state.soa[soaActiveStandard] || {})[c.id] || { applicable: true, status: "uygulanmadi", justification: "" };
    const statusOpts = SOA_STATUSES.map(s =>
      `<option value="${s.id}" ${s.id === e.status ? "selected" : ""}>${s.label}</option>`).join("");
    rows += `
      <tr class="${e.applicable === false ? "soa-na" : ""}" data-ctrl="${esc(c.id)}">
        <td class="mono">${esc(c.id)}</td>
        <td>${esc(c.title)}</td>
        <td><input type="checkbox" class="soa-applicable" ${e.applicable !== false ? "checked" : ""} aria-label="Uygulanabilir"></td>
        <td><select class="inline-select soa-status" ${e.applicable === false ? "disabled" : ""}>${statusOpts}</select></td>
        <td><input class="inline-input soa-just" value="${esc(e.justification)}" placeholder="Gerekçe / kanıt referansı"></td>
      </tr>`;
  });

  if (!filtered.length) {
    rows = `<tr class="empty-row"><td colspan="5">Aramanızla eşleşen kontrol bulunamadı.</td></tr>`;
  }

  root.innerHTML = `
    <div class="tabs">${tabs}</div>
    <div class="card">
      <h3>${esc(std.code)} — ${esc(std.subtitle)}</h3>
      <p class="card-sub">Her kontrol için uygulanabilirliği işaretleyin, durumu seçin ve gerekçeyi yazın. Değişiklikler anında kaydedilir.${soaActiveStandard === "iso27701" ? " Not: Bu sürümde Ek A (veri sorumlusu) kontrolleri yer alır; Ek B (veri işleyici) sonraki sürümde eklenecektir." : ""}</p>
      <div class="soa-toolbar">
        <input type="search" id="soaSearch" placeholder="Kontrol ara (kod, başlık, tema)…" value="${esc(soaSearch)}">
        <div class="soa-stats">
          ${badge(`%${stats.pct} tamamlanma`, stats.pct >= 75 ? "ok" : stats.pct >= 40 ? "info" : "warn")}
          ${badge(`${stats.done} uygulandı`, "ok")}
          ${badge(`${stats.partial} kısmen`, "warn")}
          ${badge(`${stats.notDone} uygulanmadı`, "bad")}
          ${badge(`${stats.excluded} hariç`, "gray")}
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th style="width:90px">Kod</th><th>Kontrol</th>
            <th style="width:60px">Uyg.</th><th style="width:150px">Durum</th>
            <th style="width:320px">Gerekçe</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;

  $$(".tab", root).forEach(t => t.addEventListener("click", () => {
    soaActiveStandard = t.dataset.std;
    soaSearch = "";
    render();
  }));

  const searchInput = $("#soaSearch", root);
  searchInput.addEventListener("input", () => {
    soaSearch = searchInput.value;
    const pos = searchInput.selectionStart;
    render();
    const ns = $("#soaSearch");
    ns.focus();
    ns.setSelectionRange(pos, pos);
  });

  $$("tr[data-ctrl]", root).forEach(tr => {
    const ctrlId = tr.dataset.ctrl;
    const applicable = $(".soa-applicable", tr);
    const status = $(".soa-status", tr);
    const just = $(".soa-just", tr);

    applicable.addEventListener("change", () => {
      const e = soaEntry(soaActiveStandard, ctrlId);
      e.applicable = applicable.checked;
      saveState();
      render();
    });
    status.addEventListener("change", () => {
      const e = soaEntry(soaActiveStandard, ctrlId);
      e.status = status.value;
      saveState();
      // Sadece rozetleri tazelemek için tam render gerekmiyor ama tutarlılık için:
      const focusCtrl = ctrlId;
      render();
      const row = $(`tr[data-ctrl="${CSS.escape(focusCtrl)}"]`);
      if (row) row.scrollIntoView({ block: "nearest" });
    });
    just.addEventListener("change", () => {
      const e = soaEntry(soaActiveStandard, ctrlId);
      e.justification = just.value;
      saveState();
    });
  });
}

/* ============================================================
   GÖRÜNÜM: Varlık Yönetimi
   ============================================================ */

function renderAssets(root) {
  const rows = state.assets.map(a => `
    <tr>
      <td class="mono">${esc(a.id)}</td>
      <td><strong>${esc(a.name)}</strong>${a.notes ? `<br><span style="color:var(--muted);font-size:12px">${esc(a.notes)}</span>` : ""}</td>
      <td>${esc(a.type)}</td>
      <td>${esc(a.owner)}</td>
      <td class="mono">${a.c} / ${a.i} / ${a.a}</td>
      <td>${badge(a.classification, a.classification === "Çok Gizli" ? "bad" : a.classification === "Gizli" ? "warn" : a.classification === "Dahili" ? "info" : "gray")}</td>
      <td><button class="btn sm ghost" data-edit="${esc(a.id)}">Düzenle</button></td>
    </tr>`).join("");

  root.innerHTML = `
    <div class="view-head">
      <p>Bilgi varlıklarını C/G-B-E (gizlilik, bütünlük, erişilebilirlik) değerleriyle kaydedin. Varlıklar risk kayıtlarına bağlanır.</p>
      <button class="btn primary" id="addAsset">+ Varlık ekle</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Varlık</th><th>Tür</th><th>Sahip</th><th>G/B/E</th><th>Sınıf</th><th></th></tr></thead>
          <tbody>${rows || `<tr class="empty-row"><td colspan="7">Henüz varlık kaydı yok. "Varlık ekle" ile başlayın.</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;

  $("#addAsset", root).addEventListener("click", () => assetModal());
  $$("button[data-edit]", root).forEach(b =>
    b.addEventListener("click", () => assetModal(state.assets.find(a => a.id === b.dataset.edit))));
}

function assetModal(asset = null) {
  const isNew = !asset;
  const a = asset || { id: nextId("AST", state.assets), name: "", type: ASSET_TYPES[0], owner: "", c: 3, i: 3, a: 3, classification: "Dahili", notes: "" };
  const scale = [1, 2, 3, 4, 5];

  openModal({
    title: isNew ? "Yeni varlık" : `Varlığı düzenle — ${a.id}`,
    bodyHTML: `
      ${fieldHTML("f-name", "Varlık adı", "text", a.name)}
      <div class="field-row">
        ${fieldHTML("f-type", "Tür", "select", a.type, { options: ASSET_TYPES })}
        ${fieldHTML("f-owner", "Varlık sahibi", "text", a.owner)}
      </div>
      <div class="field-row-3">
        ${fieldHTML("f-c", "Gizlilik (1–5)", "select", a.c, { options: scale })}
        ${fieldHTML("f-i", "Bütünlük (1–5)", "select", a.i, { options: scale })}
        ${fieldHTML("f-a", "Erişilebilirlik (1–5)", "select", a.a, { options: scale })}
      </div>
      ${fieldHTML("f-class", "Gizlilik sınıfı", "select", a.classification, { options: CLASSIFICATIONS })}
      ${fieldHTML("f-notes", "Notlar", "textarea", a.notes)}
    `,
    onSave: () => {
      const name = $("#f-name").value.trim();
      if (!name) { toast("Varlık adı boş olamaz."); return false; }
      Object.assign(a, {
        name,
        type: $("#f-type").value,
        owner: $("#f-owner").value.trim(),
        c: +$("#f-c").value, i: +$("#f-i").value, a: +$("#f-a").value,
        classification: $("#f-class").value,
        notes: $("#f-notes").value.trim()
      });
      if (isNew) state.assets.push(a);
      saveState(); render();
      toast(isNew ? "Varlık eklendi." : "Varlık güncellendi.");
    },
    danger: isNew ? null : {
      label: "Sil",
      onClick: () => {
        state.assets = state.assets.filter(x => x.id !== a.id);
        saveState(); render();
        toast("Varlık silindi.");
      }
    }
  });
}

/* ============================================================
   GÖRÜNÜM: Risk Yönetimi
   ============================================================ */

function renderRisks(root) {
  // 5x5 matris hücre sayıları
  const counts = {};
  state.risks.forEach(r => {
    const key = `${r.likelihood}-${r.impact}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  let matrixHTML = `<div class="mx-label"></div>` +
    [1, 2, 3, 4, 5].map(i => `<div class="mx-label">Etki ${i}</div>`).join("");
  for (let l = 5; l >= 1; l--) {
    matrixHTML += `<div class="mx-label">Olasılık ${l}</div>`;
    for (let i = 1; i <= 5; i++) {
      const score = l * i;
      const lvl = riskLevel(score);
      const c = counts[`${l}-${i}`];
      matrixHTML += `<div class="mx-cell ${lvl.cls}" title="${lvl.label} (skor ${score})">${score}${c ? `<span class="mx-count">${c}</span>` : ""}</div>`;
    }
  }

  const rows = state.risks.map(r => {
    const score = r.likelihood * r.impact;
    const lvl = riskLevel(score);
    const asset = state.assets.find(a => a.id === r.assetId);
    return `
      <tr>
        <td class="mono">${esc(r.id)}</td>
        <td><strong>${esc(r.title)}</strong><br><span style="color:var(--muted);font-size:12px">${esc(r.threat)}</span></td>
        <td>${asset ? esc(asset.name) : "—"}</td>
        <td class="mono">${r.likelihood} × ${r.impact} = ${score}</td>
        <td>${badge(lvl.label, lvl.color)}</td>
        <td>${esc(r.treatment)}</td>
        <td>${badge(r.status, statusBadgeColor(r.status, { "Açık": "bad", "İşlem Görüyor": "warn", "Kapatıldı": "ok", "Kabul Edildi": "info" }))}</td>
        <td><button class="btn sm ghost" data-edit="${esc(r.id)}">Düzenle</button></td>
      </tr>`;
  }).join("");

  root.innerHTML = `
    <div class="view-head">
      <p>Riskler 5×5 matris (ISO 31000 yaklaşımı) ile skorlanır ve Ek A kontrollerine bağlanabilir.</p>
      <button class="btn primary" id="addRisk">+ Risk ekle</button>
    </div>

    <div class="card">
      <h3>Risk ısı matrisi</h3>
      <p class="card-sub">Hücredeki sayı skoru, sağ üst rozet o hücredeki kayıt sayısını gösterir.</p>
      <div class="matrix-wrap">
        <div class="matrix">${matrixHTML}</div>
        <div class="matrix-legend">
          <div class="lg"><span class="sw mx-low"></span> Düşük (1–4)</div>
          <div class="lg"><span class="sw mx-med"></span> Orta (5–9)</div>
          <div class="lg"><span class="sw mx-high"></span> Yüksek (10–16)</div>
          <div class="lg"><span class="sw mx-critical"></span> Kritik (17–25)</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>Risk kaydı</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Risk</th><th>Varlık</th><th>Skor</th><th>Seviye</th><th>İşlem</th><th>Durum</th><th></th></tr></thead>
          <tbody>${rows || `<tr class="empty-row"><td colspan="8">Henüz risk kaydı yok. Önce varlıklarınızı ekleyin, ardından "Risk ekle" ile başlayın.</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;

  $("#addRisk", root).addEventListener("click", () => riskModal());
  $$("button[data-edit]", root).forEach(b =>
    b.addEventListener("click", () => riskModal(state.risks.find(r => r.id === b.dataset.edit))));
}

function riskModal(risk = null) {
  const isNew = !risk;
  const r = risk || { id: nextId("RSK", state.risks), title: "", assetId: "", threat: "", likelihood: 3, impact: 3, controls: [], treatment: RISK_TREATMENTS[0], status: RISK_STATUSES[0], owner: "" };
  const scale = [1, 2, 3, 4, 5];
  const assetOpts = [{ id: "", label: "— Seçiniz —" }].concat(state.assets.map(a => ({ id: a.id, label: `${a.id} · ${a.name}` })));

  openModal({
    title: isNew ? "Yeni risk" : `Riski düzenle — ${r.id}`,
    bodyHTML: `
      ${fieldHTML("f-title", "Risk tanımı", "text", r.title)}
      ${fieldHTML("f-threat", "Tehdit / zafiyet", "text", r.threat)}
      <div class="field-row">
        ${fieldHTML("f-asset", "İlgili varlık", "select", r.assetId, { options: assetOpts })}
        ${fieldHTML("f-owner", "Risk sahibi", "text", r.owner)}
      </div>
      <div class="field-row">
        ${fieldHTML("f-like", "Olasılık (1–5)", "select", r.likelihood, { options: scale })}
        ${fieldHTML("f-imp", "Etki (1–5)", "select", r.impact, { options: scale })}
      </div>
      <div class="field-row">
        ${fieldHTML("f-treat", "Risk işleme kararı", "select", r.treatment, { options: RISK_TREATMENTS })}
        ${fieldHTML("f-status", "Durum", "select", r.status, { options: RISK_STATUSES })}
      </div>
      ${fieldHTML("f-controls", "İlişkili kontroller (virgülle, örn: A.8.7, A.5.15)", "text", (r.controls || []).join(", "))}
    `,
    onSave: () => {
      const title = $("#f-title").value.trim();
      if (!title) { toast("Risk tanımı boş olamaz."); return false; }
      Object.assign(r, {
        title,
        threat: $("#f-threat").value.trim(),
        assetId: $("#f-asset").value,
        owner: $("#f-owner").value.trim(),
        likelihood: +$("#f-like").value,
        impact: +$("#f-imp").value,
        treatment: $("#f-treat").value,
        status: $("#f-status").value,
        controls: $("#f-controls").value.split(",").map(s => s.trim()).filter(Boolean)
      });
      if (isNew) state.risks.push(r);
      saveState(); render();
      toast(isNew ? "Risk eklendi." : "Risk güncellendi.");
    },
    danger: isNew ? null : {
      label: "Sil",
      onClick: () => {
        state.risks = state.risks.filter(x => x.id !== r.id);
        saveState(); render();
        toast("Risk silindi.");
      }
    }
  });
}

/* ============================================================
   GÖRÜNÜM: İç Denetimler
   ============================================================ */

function renderAudits(root) {
  const auditBlocks = state.audits.map(au => {
    const findings = state.findings.filter(f => f.auditId === au.id);
    const std = STANDARDS[au.standard];

    const findingItems = findings.map(f => {
      const typeCls = f.type.startsWith("Majör") ? "majör" : f.type.startsWith("Minör") ? "minör" : f.type === "Gözlem" ? "gözlem" : "fırsat";
      const linkedAction = state.actions.find(a => a.id === f.actionId);
      return `
        <div class="finding ${typeCls}">
          <div class="finding-head">
            ${badge(f.type, typeCls === "majör" ? "bad" : typeCls === "minör" ? "warn" : typeCls === "gözlem" ? "info" : "ok")}
            <span class="mono">${esc(f.clause || "")}</span>
            ${badge(f.status, f.status === "Açık" ? "bad" : "ok")}
          </div>
          <p>${esc(f.description)}</p>
          <div class="finding-foot">
            ${linkedAction
              ? `<span class="mono">→ ${esc(linkedAction.id)}</span> ${badge(linkedAction.status, linkedAction.status === "Kapatıldı" ? "ok" : "warn")}`
              : `<button class="btn sm" data-dof="${esc(f.id)}">DÖF oluştur</button>`}
            <button class="btn sm ghost" data-edit-finding="${esc(f.id)}">Düzenle</button>
          </div>
        </div>`;
    }).join("");

    return `
      <div class="card">
        <div class="view-head" style="margin-bottom:6px">
          <div>
            <h3>${esc(au.title)}</h3>
            <p class="card-sub">
              ${std ? esc(std.name) : ""} · ${fmtDate(au.date)} · Denetçi: ${esc(au.auditor)} ·
              ${badge(au.status, au.status === "Tamamlandı" ? "ok" : au.status === "Devam Ediyor" ? "warn" : "info")}
            </p>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn sm" data-add-finding="${esc(au.id)}">+ Bulgu</button>
            <button class="btn sm ghost" data-edit-audit="${esc(au.id)}">Düzenle</button>
          </div>
        </div>
        <p style="font-size:13px;color:var(--muted)"><strong>Kapsam:</strong> ${esc(au.scope)}</p>
        <div class="finding-list">
          ${findingItems || `<p style="color:var(--muted);font-size:13px">Bu denetime henüz bulgu girilmedi.</p>`}
        </div>
      </div>`;
  }).join("");

  root.innerHTML = `
    <div class="view-head">
      <p>Denetim planlayın, bulgu girin; uygunsuzluklardan tek tıkla düzeltici aksiyon (DÖF) açın.</p>
      <button class="btn primary" id="addAudit">+ Denetim planla</button>
    </div>
    ${auditBlocks || `<div class="card"><p style="color:var(--muted)">Henüz denetim kaydı yok. "Denetim planla" ile ilk denetiminizi oluşturun.</p></div>`}
  `;

  $("#addAudit", root).addEventListener("click", () => auditModal());
  $$("button[data-edit-audit]", root).forEach(b =>
    b.addEventListener("click", () => auditModal(state.audits.find(a => a.id === b.dataset.editAudit))));
  $$("button[data-add-finding]", root).forEach(b =>
    b.addEventListener("click", () => findingModal(null, b.dataset.addFinding)));
  $$("button[data-edit-finding]", root).forEach(b =>
    b.addEventListener("click", () => {
      const f = state.findings.find(x => x.id === b.dataset.editFinding);
      findingModal(f, f.auditId);
    }));
  $$("button[data-dof]", root).forEach(b =>
    b.addEventListener("click", () => createActionFromFinding(b.dataset.dof)));
}

function auditModal(audit = null) {
  const isNew = !audit;
  const a = audit || { id: nextId("AUD", state.audits), title: "", standard: "iso27001", date: "", auditor: "", scope: "", status: AUDIT_STATUSES[0] };
  const stdOpts = Object.values(STANDARDS).map(s => ({ id: s.id, label: s.code }));

  openModal({
    title: isNew ? "Yeni denetim" : `Denetimi düzenle — ${a.id}`,
    bodyHTML: `
      ${fieldHTML("f-title", "Denetim başlığı", "text", a.title)}
      <div class="field-row">
        ${fieldHTML("f-std", "Standart", "select", a.standard, { options: stdOpts })}
        ${fieldHTML("f-date", "Tarih", "date", a.date)}
      </div>
      <div class="field-row">
        ${fieldHTML("f-auditor", "Denetçi", "text", a.auditor)}
        ${fieldHTML("f-status", "Durum", "select", a.status, { options: AUDIT_STATUSES })}
      </div>
      ${fieldHTML("f-scope", "Kapsam", "textarea", a.scope)}
    `,
    onSave: () => {
      const title = $("#f-title").value.trim();
      if (!title) { toast("Denetim başlığı boş olamaz."); return false; }
      Object.assign(a, {
        title,
        standard: $("#f-std").value,
        date: $("#f-date").value,
        auditor: $("#f-auditor").value.trim(),
        status: $("#f-status").value,
        scope: $("#f-scope").value.trim()
      });
      if (isNew) state.audits.push(a);
      saveState(); render();
      toast(isNew ? "Denetim planlandı." : "Denetim güncellendi.");
    },
    danger: isNew ? null : {
      label: "Sil",
      onClick: () => {
        state.audits = state.audits.filter(x => x.id !== a.id);
        state.findings = state.findings.filter(f => f.auditId !== a.id);
        saveState(); render();
        toast("Denetim ve bulguları silindi.");
      }
    }
  });
}

function findingModal(finding = null, auditId) {
  const isNew = !finding;
  const f = finding || { id: nextId("FND", state.findings), auditId, type: FINDING_TYPES[1], clause: "", description: "", status: "Açık", actionId: "" };

  openModal({
    title: isNew ? "Yeni bulgu" : `Bulguyu düzenle — ${f.id}`,
    bodyHTML: `
      <div class="field-row">
        ${fieldHTML("f-type", "Bulgu türü", "select", f.type, { options: FINDING_TYPES })}
        ${fieldHTML("f-clause", "İlgili madde / kontrol", "text", f.clause)}
      </div>
      ${fieldHTML("f-desc", "Bulgu açıklaması", "textarea", f.description)}
      ${fieldHTML("f-status", "Durum", "select", f.status, { options: ["Açık", "Kapatıldı"] })}
    `,
    onSave: () => {
      const desc = $("#f-desc").value.trim();
      if (!desc) { toast("Bulgu açıklaması boş olamaz."); return false; }
      Object.assign(f, {
        type: $("#f-type").value,
        clause: $("#f-clause").value.trim(),
        description: desc,
        status: $("#f-status").value
      });
      if (isNew) state.findings.push(f);
      saveState(); render();
      toast(isNew ? "Bulgu eklendi." : "Bulgu güncellendi.");
    },
    danger: isNew ? null : {
      label: "Sil",
      onClick: () => {
        state.findings = state.findings.filter(x => x.id !== f.id);
        saveState(); render();
        toast("Bulgu silindi.");
      }
    }
  });
}

function createActionFromFinding(findingId) {
  const f = state.findings.find(x => x.id === findingId);
  if (!f) return;
  const action = {
    id: nextId("ACT", state.actions),
    source: "İç Denetim",
    title: `Bulgu ${f.id} için düzeltici aksiyon: ${f.description.slice(0, 60)}${f.description.length > 60 ? "…" : ""}`,
    owner: "",
    due: "",
    status: "Açık",
    rootCause: "",
    activity: ""
  };
  state.actions.push(action);
  f.actionId = action.id;
  saveState();
  toast(`${action.id} oluşturuldu ve bulguya bağlandı.`);
  navigate("actions");
}

/* ============================================================
   GÖRÜNÜM: Düzeltici Aksiyonlar
   ============================================================ */

function renderActions(root) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = state.actions.map(a => {
    const overdue = a.status !== "Kapatıldı" && a.due && a.due < today;
    return `
      <tr>
        <td class="mono">${esc(a.id)}</td>
        <td><strong>${esc(a.title)}</strong>${a.rootCause ? `<br><span style="color:var(--muted);font-size:12px">Kök neden: ${esc(a.rootCause)}</span>` : ""}</td>
        <td>${esc(a.source)}</td>
        <td>${esc(a.owner || "—")}</td>
        <td>${fmtDate(a.due)} ${overdue ? badge("Gecikti", "bad") : ""}</td>
        <td>${badge(a.status, statusBadgeColor(a.status, { "Açık": "bad", "Devam Ediyor": "warn", "Doğrulama Bekliyor": "info", "Kapatıldı": "ok" }))}</td>
        <td><button class="btn sm ghost" data-edit="${esc(a.id)}">Düzenle</button></td>
      </tr>`;
  }).join("");

  const open = state.actions.filter(a => a.status !== "Kapatıldı").length;
  const overdueCount = state.actions.filter(a => a.status !== "Kapatıldı" && a.due && a.due < today).length;

  root.innerHTML = `
    <div class="view-head">
      <p>${state.actions.length} kayıt · <strong>${open}</strong> açık · <strong style="color:${overdueCount ? "var(--bad)" : "inherit"}">${overdueCount}</strong> gecikmiş</p>
      <button class="btn primary" id="addAction">+ Aksiyon ekle</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Aksiyon</th><th>Kaynak</th><th>Sorumlu</th><th>Termin</th><th>Durum</th><th></th></tr></thead>
          <tbody>${rows || `<tr class="empty-row"><td colspan="7">Henüz aksiyon kaydı yok. Denetim bulgularından "DÖF oluştur" ile veya buradan elle ekleyebilirsiniz.</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;

  $("#addAction", root).addEventListener("click", () => actionModal());
  $$("button[data-edit]", root).forEach(b =>
    b.addEventListener("click", () => actionModal(state.actions.find(a => a.id === b.dataset.edit))));
}

function actionModal(action = null) {
  const isNew = !action;
  const a = action || { id: nextId("ACT", state.actions), source: ACTION_SOURCES[0], title: "", owner: "", due: "", status: ACTION_STATUSES[0], rootCause: "", activity: "" };

  openModal({
    title: isNew ? "Yeni düzeltici aksiyon" : `Aksiyonu düzenle — ${a.id}`,
    bodyHTML: `
      ${fieldHTML("f-title", "Aksiyon tanımı", "text", a.title)}
      <div class="field-row">
        ${fieldHTML("f-source", "Kaynak", "select", a.source, { options: ACTION_SOURCES })}
        ${fieldHTML("f-status", "Durum", "select", a.status, { options: ACTION_STATUSES })}
      </div>
      <div class="field-row">
        ${fieldHTML("f-owner", "Sorumlu", "text", a.owner)}
        ${fieldHTML("f-due", "Termin tarihi", "date", a.due)}
      </div>
      ${fieldHTML("f-root", "Kök neden analizi", "textarea", a.rootCause)}
      ${fieldHTML("f-activity", "Yapılan faaliyetler", "textarea", a.activity)}
    `,
    onSave: () => {
      const title = $("#f-title").value.trim();
      if (!title) { toast("Aksiyon tanımı boş olamaz."); return false; }
      Object.assign(a, {
        title,
        source: $("#f-source").value,
        status: $("#f-status").value,
        owner: $("#f-owner").value.trim(),
        due: $("#f-due").value,
        rootCause: $("#f-root").value.trim(),
        activity: $("#f-activity").value.trim()
      });
      if (isNew) state.actions.push(a);
      saveState(); render();
      toast(isNew ? "Aksiyon eklendi." : "Aksiyon güncellendi.");
    },
    danger: isNew ? null : {
      label: "Sil",
      onClick: () => {
        state.actions = state.actions.filter(x => x.id !== a.id);
        state.findings.forEach(f => { if (f.actionId === a.id) f.actionId = ""; });
        saveState(); render();
        toast("Aksiyon silindi.");
      }
    }
  });
}

/* ============================================================
   GÖRÜNÜM: Dokümanlar
   ============================================================ */

function renderDocuments(root) {
  const rows = state.documents.map(d => `
    <tr>
      <td class="mono">${esc(d.code)}</td>
      <td><strong>${esc(d.title)}</strong></td>
      <td>${esc(d.type)}</td>
      <td class="mono">v${esc(d.version)}</td>
      <td>${badge(d.status, statusBadgeColor(d.status, { "Yayında": "ok", "Onayda": "info", "Taslak": "gray", "Revizyonda": "warn", "Arşiv": "gray" }))}</td>
      <td>${esc(d.owner)}</td>
      <td>${fmtDate(d.date)}</td>
      <td><button class="btn sm ghost" data-edit="${esc(d.id)}">Düzenle</button></td>
    </tr>`).join("");

  root.innerHTML = `
    <div class="view-head">
      <p>Politika, prosedür ve kayıtların ana listesi. Versiyon ve onay durumu buradan izlenir.</p>
      <button class="btn primary" id="addDoc">+ Doküman ekle</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Kod</th><th>Doküman</th><th>Tür</th><th>Ver.</th><th>Durum</th><th>Sahip</th><th>Tarih</th><th></th></tr></thead>
          <tbody>${rows || `<tr class="empty-row"><td colspan="8">Henüz doküman kaydı yok.</td></tr>`}</tbody>
        </table>
      </div>
    </div>`;

  $("#addDoc", root).addEventListener("click", () => docModal());
  $$("button[data-edit]", root).forEach(b =>
    b.addEventListener("click", () => docModal(state.documents.find(d => d.id === b.dataset.edit))));
}

function docModal(doc = null) {
  const isNew = !doc;
  const d = doc || { id: nextId("DOC", state.documents), code: "", title: "", type: DOC_TYPES[0], version: "1.0", status: DOC_STATUSES[0], owner: "", date: new Date().toISOString().slice(0, 10) };

  openModal({
    title: isNew ? "Yeni doküman" : `Dokümanı düzenle — ${d.id}`,
    bodyHTML: `
      <div class="field-row">
        ${fieldHTML("f-code", "Doküman kodu", "text", d.code)}
        ${fieldHTML("f-version", "Versiyon", "text", d.version)}
      </div>
      ${fieldHTML("f-title", "Doküman adı", "text", d.title)}
      <div class="field-row">
        ${fieldHTML("f-type", "Tür", "select", d.type, { options: DOC_TYPES })}
        ${fieldHTML("f-status", "Durum", "select", d.status, { options: DOC_STATUSES })}
      </div>
      <div class="field-row">
        ${fieldHTML("f-owner", "Doküman sahibi", "text", d.owner)}
        ${fieldHTML("f-date", "Son güncelleme", "date", d.date)}
      </div>
    `,
    onSave: () => {
      const title = $("#f-title").value.trim();
      if (!title) { toast("Doküman adı boş olamaz."); return false; }
      Object.assign(d, {
        code: $("#f-code").value.trim(),
        title,
        type: $("#f-type").value,
        version: $("#f-version").value.trim(),
        status: $("#f-status").value,
        owner: $("#f-owner").value.trim(),
        date: $("#f-date").value
      });
      if (isNew) state.documents.push(d);
      saveState(); render();
      toast(isNew ? "Doküman eklendi." : "Doküman güncellendi.");
    },
    danger: isNew ? null : {
      label: "Sil",
      onClick: () => {
        state.documents = state.documents.filter(x => x.id !== d.id);
        saveState(); render();
        toast("Doküman silindi.");
      }
    }
  });
}

/* ============================================================
   GÖRÜNÜM: KPI
   ============================================================ */

function renderKPIs(root) {
  const cards = state.kpis.map(k => {
    const last = k.values[k.values.length - 1];
    const lastVal = last ? last.value : null;
    const onTarget = lastVal === null ? null
      : k.direction === "up" ? lastVal >= k.target : lastVal <= k.target;

    const maxVal = Math.max(k.target, ...k.values.map(v => v.value), 1);
    const bars = k.values.map(v => {
      const hit = k.direction === "up" ? v.value >= k.target : v.value <= k.target;
      return `
        <div class="kpi-bar">
          <span class="bar-val">${v.value}</span>
          <div class="bar ${hit ? "" : "miss"}" style="height:${Math.max(6, (v.value / maxVal) * 100)}%"></div>
          <span class="bar-label">${esc(v.period)}</span>
        </div>`;
    }).join("");

    return `
      <div class="card kpi-card">
        <div class="kpi-top">
          <div>
            <h3>${esc(k.name)}</h3>
            <div class="kpi-value">${lastVal !== null ? lastVal : "—"}<span class="kpi-unit"> ${esc(k.unit)}</span></div>
            <div class="kpi-target">Hedef: ${k.target} ${esc(k.unit)} (${k.direction === "up" ? "↑ yüksek iyi" : "↓ düşük iyi"})</div>
          </div>
          <div style="display:grid;gap:6px;justify-items:end">
            ${onTarget === null ? badge("Ölçüm yok", "gray") : onTarget ? badge("Hedefte", "ok") : badge("Hedef altı", "bad")}
            <button class="btn sm ghost" data-edit="${esc(k.id)}">Düzenle</button>
            <button class="btn sm" data-measure="${esc(k.id)}">+ Ölçüm</button>
          </div>
        </div>
        <div class="kpi-bars">${bars || `<span style="color:var(--muted);font-size:13px">Henüz ölçüm girilmedi.</span>`}</div>
      </div>`;
  }).join("");

  root.innerHTML = `
    <div class="view-head">
      <p>BGYS performans göstergeleri. Her dönem ölçüm ekleyin; hedef karşılaştırması otomatik yapılır.</p>
      <button class="btn primary" id="addKpi">+ KPI tanımla</button>
    </div>
    <div class="grid grid-2">
      ${cards || `<div class="card"><p style="color:var(--muted)">Henüz KPI tanımlanmadı. Örnek: "Farkındalık eğitimi tamamlama oranı", hedef %95.</p></div>`}
    </div>`;

  $("#addKpi", root).addEventListener("click", () => kpiModal());
  $$("button[data-edit]", root).forEach(b =>
    b.addEventListener("click", () => kpiModal(state.kpis.find(k => k.id === b.dataset.edit))));
  $$("button[data-measure]", root).forEach(b =>
    b.addEventListener("click", () => measureModal(state.kpis.find(k => k.id === b.dataset.measure))));
}

function kpiModal(kpi = null) {
  const isNew = !kpi;
  const k = kpi || { id: nextId("KPI", state.kpis), name: "", unit: "%", target: 90, direction: "up", values: [] };

  openModal({
    title: isNew ? "Yeni KPI" : `KPI düzenle — ${k.id}`,
    bodyHTML: `
      ${fieldHTML("f-name", "Gösterge adı", "text", k.name)}
      <div class="field-row-3">
        ${fieldHTML("f-target", "Hedef", "number", k.target)}
        ${fieldHTML("f-unit", "Birim", "text", k.unit)}
        ${fieldHTML("f-dir", "Yön", "select", k.direction, { options: KPI_DIRECTIONS })}
      </div>
    `,
    onSave: () => {
      const name = $("#f-name").value.trim();
      if (!name) { toast("Gösterge adı boş olamaz."); return false; }
      Object.assign(k, {
        name,
        target: +$("#f-target").value || 0,
        unit: $("#f-unit").value.trim(),
        direction: $("#f-dir").value
      });
      if (isNew) state.kpis.push(k);
      saveState(); render();
      toast(isNew ? "KPI tanımlandı." : "KPI güncellendi.");
    },
    danger: isNew ? null : {
      label: "Sil",
      onClick: () => {
        state.kpis = state.kpis.filter(x => x.id !== k.id);
        saveState(); render();
        toast("KPI silindi.");
      }
    }
  });
}

function measureModal(kpi) {
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;

  openModal({
    title: `Ölçüm ekle — ${kpi.name}`,
    bodyHTML: `
      <div class="field-row">
        ${fieldHTML("f-period", "Dönem (örn: 2026-Q3)", "text", defaultPeriod)}
        ${fieldHTML("f-value", `Değer (${esc(kpi.unit)})`, "number", "")}
      </div>
    `,
    saveLabel: "Ölçümü kaydet",
    onSave: () => {
      const period = $("#f-period").value.trim();
      const value = $("#f-value").value;
      if (!period || value === "") { toast("Dönem ve değer zorunludur."); return false; }
      kpi.values.push({ period, value: +value });
      saveState(); render();
      toast("Ölçüm eklendi.");
    }
  });
}

/* ============================================================
   GÖRÜNÜM: Veri ve Ayarlar
   ============================================================ */

function renderSettings(root) {
  root.innerHTML = `
    <div class="card">
      <h3>Kuruluş</h3>
      <p class="card-sub">Panelde görüntülenecek kuruluş adı.</p>
      <div class="field" style="max-width:380px">
        <label for="orgName">Kuruluş adı</label>
        <input id="orgName" value="${esc(state.org.name)}">
      </div>
      <button class="btn primary" id="saveOrg">Kuruluş adını kaydet</button>
    </div>

    <div class="card">
      <h3>Veri yönetimi</h3>
      <p class="card-sub">Tüm kayıtlar bu tarayıcıda (localStorage) tutulur. Yedek almak için dışa aktarın; başka makinede içe aktarabilirsiniz.</p>
      <div class="settings-actions">
        <button class="btn" id="exportData">JSON dışa aktar</button>
        <button class="btn" id="importData">JSON içe aktar</button>
        <input type="file" id="importFile" accept="application/json" hidden>
        <button class="btn" id="loadSeed">Örnek veri yükle</button>
        <button class="btn danger" id="resetData">Tüm verileri sıfırla</button>
      </div>
    </div>

    <div class="card">
      <h3>Prototip notları</h3>
      <p class="card-sub">
        Bu sürüm tek kullanıcılı bir prototiptir: kimlik doğrulama, rol modeli ve sunucu tarafı
        Next.js + Supabase aşamasında eklenecektir. ISO 27701 Ek B (veri işleyici) kontrolleri ve
        YGG (Yönetimin Gözden Geçirmesi) modülü yol haritasındadır.
      </p>
    </div>`;

  $("#saveOrg", root).addEventListener("click", () => {
    const name = $("#orgName").value.trim();
    if (!name) { toast("Kuruluş adı boş olamaz."); return; }
    state.org.name = name;
    saveState(); render();
    toast("Kuruluş adı güncellendi.");
  });

  $("#exportData", root).addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `grc-suite-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Yedek dosyası indirildi.");
  });

  $("#importData", root).addEventListener("click", () => $("#importFile").click());
  $("#importFile", root).addEventListener("change", (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        state = Object.assign(emptyState(), parsed);
        saveState(); render();
        toast("Veriler içe aktarıldı.");
      } catch {
        toast("Dosya okunamadı: geçerli bir JSON yedeği seçin.");
      }
    };
    reader.readAsText(file);
  });

  $("#loadSeed", root).addEventListener("click", loadSeedData);

  $("#resetData", root).addEventListener("click", () => {
    openModal({
      title: "Tüm verileri sıfırla",
      bodyHTML: `<p>Bu işlem tüm varlık, risk, denetim, aksiyon, doküman, KPI ve SOA kayıtlarını kalıcı olarak siler. Devam etmeden önce dışa aktarmanız önerilir.</p>`,
      saveLabel: "Evet, sıfırla",
      onSave: () => {
        state = emptyState();
        saveState();
        navigate("dashboard");
        toast("Tüm veriler sıfırlandı.");
      }
    });
  });
}

function loadSeedData() {
  state.assets = JSON.parse(JSON.stringify(SEED_DATA.assets));
  state.risks = JSON.parse(JSON.stringify(SEED_DATA.risks));
  state.audits = JSON.parse(JSON.stringify(SEED_DATA.audits));
  state.findings = JSON.parse(JSON.stringify(SEED_DATA.findings));
  state.actions = JSON.parse(JSON.stringify(SEED_DATA.actions));
  state.documents = JSON.parse(JSON.stringify(SEED_DATA.documents));
  state.kpis = JSON.parse(JSON.stringify(SEED_DATA.kpis));
  state.soa = JSON.parse(JSON.stringify(SEED_DATA.soaSeed));
  saveState();
  navigate("dashboard");
  toast("Örnek veriler yüklendi.");
}

/* ---------------- Başlatma ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  $$(".nav-item").forEach(b => b.addEventListener("click", () => navigate(b.dataset.view)));
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalBackdrop").addEventListener("click", (e) => {
    if (e.target === $("#modalBackdrop")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#modalBackdrop").hidden) closeModal();
  });
  $("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

  navigate("dashboard");
});
