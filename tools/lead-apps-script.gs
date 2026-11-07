/**
 * Project Hunar lead handler (Google Apps Script), bound to the "Hunar Leads" sheet.
 *
 * SETUP: run setup() once (it creates the headers, the Status dropdown and the two Drive
 * folders), then Deploy > New deployment > Web app (Execute as: Me, Access: Anyone) and
 * paste the web-app URL into ENDPOINT in assets/js/enquiry.js.
 * Put the product photos you want emailed to clients into the Drive folder "Hunar Product Photos".
 */
var TEAM_EMAIL = 'anubhavedungo@gmail.com';
var LOGO_URL   = 'https://anubhavngo.in/wp-content/uploads/2025/07/Group-5-scaled.png';
var SITE_URL   = 'https://projecthunar.in/';
var PRODUCT_FOLDER = 'Hunar Product Photos';
var UPLOAD_FOLDER  = 'Hunar Enquiry Uploads';
var MAX_ATTACHMENTS = 5;
var MAX_BYTES = 15 * 1024 * 1024;
var STATUSES = ['New', 'Called', 'Quoted', 'Won', 'Lost'];
var HEADERS = ['Time', 'Name', 'City', 'Mobile', 'Email', 'Fabric source', 'Fabric material', 'Timeline', 'Status', 'Client mailed', 'Photos', 'Page'];

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
  var range = sh.getRange(2, HEADERS.indexOf('Status') + 1, 1000, 1);
  range.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
  var colors = { New: '#f6d5c8', Called: '#d6def2', Quoted: '#eee6c8', Won: '#cfe8d3', Lost: '#e5e5e5' };
  sh.setConditionalFormatRules(Object.keys(colors).map(function (s) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s).setBackground(colors[s]).setRanges([range]).build();
  }));
  sh.setColumnWidths(1, HEADERS.length, 130);
  // Authorise mail permission now so the first real lead does not fail.
  MailApp.getRemainingDailyQuota();
}

function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads') || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var photos = [saveUploads_(d), d.photo_link || ''].filter(String).join(' | ');
  var mailed = 'No (no email given)';
  if (d.email) {
    try { sendClientMail_(d); mailed = 'Yes'; } catch (err) { mailed = 'Failed: ' + err.message; }
  }
  sh.appendRow([new Date(d.time), d.name, d.city, "'" + d.mobile, d.email || '', d.fabric_source,
                d.fabric_material, d.timeline, 'New', mailed, photos, d.page]);
  MailApp.sendEmail({
    to: TEAM_EMAIL, name: 'Project Hunar website',
    subject: 'New Hunar lead: ' + d.name + ' (' + d.city + ')',
    body: 'Name: ' + d.name + '\nCity: ' + d.city + '\nMobile: ' + d.mobile + '\nEmail: ' + (d.email || '-') +
          '\nFabric: ' + d.fabric_source + ' ' + (d.fabric_material || '') + '\nTimeline: ' + d.timeline +
          '\nPhotos: ' + (photos || '-') + '\nClient mailed: ' + mailed +
          '\n\nSheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  });
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

function esc_(s) {
  return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}

function sendClientMail_(d) {
  var files = folder_(PRODUCT_FOLDER).getFiles(), attach = [], total = 0;
  while (files.hasNext() && attach.length < MAX_ATTACHMENTS) {
    var f = files.next();
    if (f.getMimeType().indexOf('image/') !== 0 || total + f.getSize() > MAX_BYTES) continue;
    total += f.getSize();
    attach.push(f.getBlob());
  }
  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1c1a16;line-height:1.55">' +
    '<div style="padding:18px 0;border-bottom:3px solid #c1552a"><img src="' + LOGO_URL + '" alt="Anubhav NGO" height="44" style="height:44px;width:auto"></div>' +
    '<h2 style="margin:22px 0 8px">Thank you, ' + esc_(d.name) + '!</h2>' +
    '<p>We have received your enquiry. Our team will call you on <b>' + esc_(d.mobile) + '</b> shortly.</p>' +
    '<table style="border-collapse:collapse;width:100%;font-size:14px;margin:14px 0">' +
    '<tr><td style="padding:6px 0;color:#6b665b">City</td><td>' + esc_(d.city) + '</td></tr>' +
    '<tr><td style="padding:6px 0;color:#6b665b">Fabric</td><td>' + esc_(d.fabric_source) + (d.fabric_material ? ' (' + esc_(d.fabric_material) + ')' : '') + '</td></tr>' +
    '<tr><td style="padding:6px 0;color:#6b665b">Timeline</td><td>' + esc_(d.timeline) + '</td></tr></table>' +
    '<p><b>What to expect</b></p><ul style="padding-left:18px">' +
    '<li>Minimum order: 25 pieces per product</li>' +
    '<li>Bulk price, sampling cost and measurements will be shared on the call</li></ul>' +
    '<p>' + (attach.length ? 'A few pieces of our work are attached. ' : '') + 'See the full range at <a href="' + SITE_URL + 'catalogue.html" style="color:#c1552a">projecthunar.in</a>.</p>' +
    '<p style="margin-top:24px">Warm regards,<br><b>Project Hunar</b><br>An initiative by Anubhav NGO<br>' +
    '<a href="' + SITE_URL + '" style="color:#c1552a">projecthunar.in</a> &middot; +91 79827 99527</p></div>';
  MailApp.sendEmail({
    to: d.email, replyTo: TEAM_EMAIL, name: 'Project Hunar by Anubhav NGO',
    subject: 'Thank you for your enquiry - Project Hunar',
    htmlBody: html, body: 'Thank you for your enquiry. Our team will call you shortly. ' + SITE_URL,
    attachments: attach
  });
}
