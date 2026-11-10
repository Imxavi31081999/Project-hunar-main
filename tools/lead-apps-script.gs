/**
 * Project Hunar lead handler (Google Apps Script), bound to the "Hunar Leads" sheet.
 *
 * SETUP: run setup() once (creates headers, Status dropdown and the two Drive folders),
 * then Deploy > New deployment > Web app (Execute as: Me, Access: Anyone) and paste the
 * web-app URL into ENDPOINT in assets/js/enquiry.js.
 * Put product photos for the client email into the Drive folder "Hunar Product Photos".
 * After editing this script: Deploy > Manage deployments > Edit > New version.
 */
var TEAM_EMAIL = 'anubhavedungo@gmail.com';
var LOGO_URL   = 'https://anubhavngo.in/wp-content/uploads/2025/07/Group-5-scaled.png';
var SITE_URL   = 'https://projecthunar.in/';
var PHONE      = '+91 79827 99527';
var INSTAGRAM  = 'https://www.instagram.com/anubhav.ngo';
var PRODUCT_FOLDER = 'Hunar Product Photos';
var UPLOAD_FOLDER  = 'Hunar Enquiry Uploads';
var MAX_ATTACHMENTS = 5;
var MAX_BYTES = 15 * 1024 * 1024;
var STATUSES = ['New', 'Called', 'Quoted', 'Won', 'Lost'];
// Pieces comes from the form. Sample cost and Price per piece are filled in by the team; Bulk total is a formula.
var HEADERS = ['Time', 'Name', 'City', 'Mobile', 'Email', 'Fabric source', 'Fabric material', 'Quote for', 'Pieces', 'Timeline', 'Status',
               'Sample cost (INR)', 'Price per piece (INR)', 'Bulk total (INR)', 'Client mailed', 'Photos', 'Page', 'Measurements'];

// Brand colours for emails
var C = { clay: '#c1552a', ink: '#1c1a16', muted: '#6b665b', paper: '#f4efe4', line: '#e6dfcf', indigo: '#33456e' };
var FONT = "font-family:Arial,Helvetica,sans-serif;";

function folder_(name) {
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function setup() {
  folder_(PRODUCT_FOLDER); folder_(UPLOAD_FOLDER);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  sh.setName('Leads');
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#33456e').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.getRange(2, 1, 1000, HEADERS.length).clearDataValidations();
  sh.getRange(2, HEADERS.indexOf('Sample cost (INR)') + 1, 1000, 3).setNumberFormat('#,##0').setBackground('#fbf7ea');
  var range = sh.getRange(2, HEADERS.indexOf('Status') + 1, 1000, 1);
  range.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
  var colors = { New: '#f6d5c8', Called: '#d6def2', Quoted: '#eee6c8', Won: '#cfe8d3', Lost: '#e5e5e5' };
  sh.setConditionalFormatRules(Object.keys(colors).map(function (s) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s).setBackground(colors[s]).setRanges([range]).build();
  }));
  sh.setColumnWidths(1, HEADERS.length, 130);
  MailApp.getRemainingDailyQuota();
}

function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Leads') || ss.getSheets()[0];
  var uploadUrl = saveUploads_(d);
  var photos = [uploadUrl, d.photo_link || ''].filter(String).join(' | ');
  var mailed = 'No (no email given)';
  if (d.email) {
    try { sendClientMail_(d); mailed = 'Yes'; } catch (err) { mailed = 'Failed: ' + err.message; }
  }
  d.quote_for = d.quote_for || 'Bulk order price';
  d.quantity = d.quote_for === 'Sample cost' ? '' : Math.max(25, parseInt(d.quantity, 10) || 25);
  sh.appendRow([new Date(d.time), d.name, d.city, "'" + d.mobile, d.email || '', d.fabric_source,
                d.fabric_material, d.quote_for, d.quantity, d.timeline, 'New', '', '', '', mailed, photos, d.page, d.measurements || '']);
  // Bulk total = Pieces x Price per piece (shows once the team enters the price)
  var qc = HEADERS.indexOf('Pieces') + 1, pc = HEADERS.indexOf('Price per piece (INR)') + 1, tc = HEADERS.indexOf('Bulk total (INR)') + 1;
  sh.getRange(sh.getLastRow(), tc).setFormulaR1C1('=IF(AND(RC[' + (qc - tc) + ']<>"",RC[' + (pc - tc) + ']<>""),RC[' + (qc - tc) + ']*RC[' + (pc - tc) + '],"")');
  try { sendTeamMail_(d, uploadUrl, mailed, ss.getUrl()); } catch (err2) {}
  return ContentService.createTextOutput('ok');
}

function saveUploads_(d) {
  if (!d.files || !d.files.length) return '';
  var dir = folder_(UPLOAD_FOLDER).createFolder(d.name + ' - ' + d.city + ' - ' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM HH:mm'));
  d.files.slice(0, 4).forEach(function (f, i) {
    dir.createFile(Utilities.newBlob(Utilities.base64Decode(f.data), f.mime, (i + 1) + '-' + f.name));
  });
  return dir.getUrl();
}

/* ---------- email helpers ---------- */
function esc_(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}

function row_(label, value) {
  if (!value) return '';
  return '<tr><td style="' + FONT + 'padding:9px 0;width:38%;font-size:13px;color:' + C.muted + ';border-bottom:1px solid ' + C.line + ';vertical-align:top">' + label + '</td>' +
         '<td style="' + FONT + 'padding:9px 0;font-size:14px;color:' + C.ink + ';font-weight:bold;border-bottom:1px solid ' + C.line + ';vertical-align:top">' + value + '</td></tr>';
}

function btn_(href, text, primary) {
  var bg = primary ? C.clay : '#ffffff', fg = primary ? '#ffffff' : C.clay;
  return '<a href="' + href + '" style="' + FONT + 'display:inline-block;margin:0 8px 8px 0;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:bold;text-decoration:none;background:' + bg + ';color:' + fg + ';border:2px solid ' + C.clay + '">' + text + '</a>';
}

function shell_(preheader, inner) {
  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:' + C.paper + '">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:' + C.paper + '">' + esc_(preheader) + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.paper + ';padding:24px 12px"><tr><td align="center">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ' + C.line + '">' +
    '<tr><td style="padding:22px 32px;border-bottom:4px solid ' + C.clay + '"><img src="' + LOGO_URL + '" alt="Anubhav NGO" height="42" style="display:block;height:42px;width:auto;border:0"></td></tr>' +
    inner +
    '<tr><td style="' + FONT + 'padding:22px 32px;background:' + C.ink + ';color:#cfc8b8;font-size:12px;line-height:1.7">' +
    '<b style="color:#ffffff;font-size:14px">Project Hunar</b><br>An initiative by Anubhav NGO, handmade by women artisans<br>' +
    '<a href="' + SITE_URL + '" style="color:#e0774a;text-decoration:none">projecthunar.in</a> &nbsp;|&nbsp; ' + PHONE + ' &nbsp;|&nbsp; ' +
    '<a href="' + INSTAGRAM + '" style="color:#e0774a;text-decoration:none">@anubhav.ngo</a><br>' +
    'A-128/1, 2nd Floor, Mohammad Pur, Near Bhikaji Cama Place, New Delhi 66</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function step_(n, title, text) {
  return '<tr><td style="vertical-align:top;width:34px;padding:0 0 14px"><div style="' + FONT + 'width:26px;height:26px;border-radius:13px;background:' + C.clay + ';color:#ffffff;font-size:13px;font-weight:bold;text-align:center;line-height:26px">' + n + '</div></td>' +
         '<td style="' + FONT + 'padding:0 0 14px;font-size:14px;line-height:1.5;color:' + C.ink + '"><b>' + title + '</b><br><span style="color:' + C.muted + '">' + text + '</span></td></tr>';
}

function linksHtml_(d, uploadUrl) {
  var parts = [];
  if (uploadUrl) parts.push('<a href="' + uploadUrl + '" style="color:' + C.clay + '">Uploaded photos</a>');
  String(d.photo_link || '').split(' | ').filter(String).forEach(function (u, i) {
    parts.push('<a href="' + esc_(u) + '" style="color:' + C.clay + '">Link ' + (i + 1) + '</a>');
  });
  return parts.join(' &nbsp;&middot;&nbsp; ');
}

/* ---------- client email ---------- */
function sendClientMail_(d) {
  var files = folder_(PRODUCT_FOLDER).getFiles(), attach = [], total = 0;
  while (files.hasNext() && attach.length < MAX_ATTACHMENTS) {
    var f = files.next();
    if (f.getMimeType().indexOf('image/') !== 0 || total + f.getSize() > MAX_BYTES) continue;
    total += f.getSize();
    attach.push(f.getBlob());
  }
  var fabric = esc_(d.fabric_source) + (d.fabric_material ? ' (' + esc_(d.fabric_material) + ')' : '');
  var inner =
    '<tr><td style="' + FONT + 'padding:30px 32px 6px">' +
      '<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:' + C.clay + ';font-weight:bold">Enquiry received</div>' +
      '<h1 style="margin:8px 0 10px;font-size:26px;line-height:1.25;color:' + C.ink + '">Thank you, ' + esc_(d.name) + '!</h1>' +
      '<p style="margin:0;font-size:15px;line-height:1.6;color:' + C.muted + '">We have received your enquiry. Our team will call you on <b style="color:' + C.ink + '">' + esc_(d.mobile) + '</b> shortly.</p>' +
    '</td></tr>' +
    '<tr><td style="padding:20px 32px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.paper + ';border-radius:10px"><tr><td style="padding:6px 20px 12px">' +
      '<div style="' + FONT + 'padding:12px 0 2px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:' + C.muted + ';font-weight:bold">Your enquiry</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
        row_('City', esc_(d.city)) + row_('Mobile', esc_(d.mobile)) + row_('Fabric', fabric) + row_('Quote for', esc_(d.quote_for)) + row_('Pieces', esc_(d.quantity)) + row_('Measurements', esc_(d.measurements || '-')) + row_('Timeline', esc_(d.timeline)) +
        row_('Reference photos', linksHtml_(d, d.files && d.files.length ? 'x' : '') ? 'Received' : '') +
      '</table></td></tr></table></td></tr>' +
    '<tr><td style="padding:22px 32px 4px"><div style="' + FONT + 'margin-bottom:14px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:' + C.muted + ';font-weight:bold">What happens next</div>' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
        step_(1, 'We call you', 'A team member phones you to understand your requirement.') +
        step_(2, 'You get the numbers', 'Bulk price, sampling cost and measurements. Minimum order is 25 pieces per product.') +
        step_(3, 'Sample, then production', 'Once you approve the sample, our artisans begin your order.') +
      '</table></td></tr>' +
    '<tr><td style="' + FONT + 'padding:8px 32px 30px">' +
      (attach.length ? '<p style="margin:0 0 16px;font-size:14px;color:' + C.muted + '">A few pieces of our work are attached to this email.</p>' : '') +
      btn_(SITE_URL + 'catalogue.html', 'View our catalogue', true) + btn_(SITE_URL, 'Visit projecthunar.in', false) +
    '</td></tr>';
  MailApp.sendEmail({
    to: d.email, replyTo: TEAM_EMAIL, name: 'Project Hunar by Anubhav NGO',
    subject: 'Thank you for your enquiry - Project Hunar',
    htmlBody: shell_('We received your enquiry. Our team will call you shortly.', inner),
    body: 'Hello ' + d.name + ', thank you for your enquiry. Our team will call you on ' + d.mobile + ' shortly. ' + SITE_URL,
    attachments: attach
  });
}

/* ---------- team alert ---------- */
function sendTeamMail_(d, uploadUrl, mailed, sheetUrl) {
  var wa = 'https://wa.me/91' + String(d.mobile).replace(/\D/g, '');
  var links = linksHtml_(d, uploadUrl);
  var inner =
    '<tr><td style="' + FONT + 'padding:26px 32px 4px">' +
      '<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:' + C.clay + ';font-weight:bold">New website lead</div>' +
      '<h1 style="margin:8px 0 4px;font-size:24px;color:' + C.ink + '">' + esc_(d.name) + ', ' + esc_(d.city) + '</h1>' +
      '<p style="margin:0;font-size:14px;color:' + C.muted + '">Call within the day for the best chance of converting.</p>' +
    '</td></tr>' +
    '<tr><td style="padding:14px 32px 4px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
      row_('Mobile', '<a href="tel:' + esc_(d.mobile) + '" style="color:' + C.clay + ';text-decoration:none">' + esc_(d.mobile) + '</a>') +
      row_('Email', d.email ? '<a href="mailto:' + esc_(d.email) + '" style="color:' + C.clay + ';text-decoration:none">' + esc_(d.email) + '</a>' : '') +
      row_('City', esc_(d.city)) +
      row_('Fabric', esc_(d.fabric_source)) +
      row_('Fabric material', esc_(d.fabric_material)) +
      row_('Quote for', esc_(d.quote_for)) +
      row_('Pieces wanted', esc_(d.quantity)) +
      row_('Measurements', esc_(d.measurements || '-')) +
      row_('Timeline', esc_(d.timeline)) +
      row_('Reference photos', links) +
      row_('Client email sent', esc_(mailed)) +
      row_('Came from', '<a href="' + esc_(d.page) + '" style="color:' + C.clay + ';text-decoration:none">' + esc_(d.page) + '</a>') +
    '</table></td></tr>' +
    '<tr><td style="' + FONT + 'padding:18px 32px 28px">' +
      btn_('tel:' + esc_(d.mobile), 'Call now', true) + btn_(wa, 'WhatsApp', false) + btn_(sheetUrl, 'Open sheet', false) +
    '</td></tr>';
  MailApp.sendEmail({
    to: TEAM_EMAIL, name: 'Project Hunar website',
    subject: 'New Hunar lead: ' + d.name + ' (' + d.city + ')',
    htmlBody: shell_('New lead from ' + d.name + ' in ' + d.city + '. Mobile ' + d.mobile, inner),
    body: 'New lead: ' + d.name + ', ' + d.city + '. Mobile: ' + d.mobile + '. Email: ' + (d.email || '-') +
          '. Fabric: ' + d.fabric_source + ' ' + (d.fabric_material || '') + '. Quote for: ' + d.quote_for + '. Pieces: ' + d.quantity + '. Timeline: ' + d.timeline + '. Sheet: ' + sheetUrl
  });
}

/** Run once: gives the team Gmail view-only access to both Drive folders (product photos + customer uploads). */
function shareFolders() {
  [folder_(PRODUCT_FOLDER), folder_(UPLOAD_FOLDER)].forEach(function (f) { f.addViewer(TEAM_EMAIL); });
}
