const byId = id => document.getElementById(id);
const market = byId('market');
const modal = byId('checkout');
const form = byId('checkout-form');
const status = byId('checkout-status');
const quantityInput = byId('gel-quantity');
const languageButton = byId('language');
const localized = [...document.querySelectorAll('[data-zh]')].map(element => ({
  element, english: element.innerHTML
}));
const localizedImages = [...document.querySelectorAll('[data-alt-zh]')].map(image => ({
  image, english: image.alt
}));
const catalogue = {
  gel: { name: 'Pore Refining Gel', MY: 219, SG: 79 },
  bundle: { name: 'Pore Refining Gel + Nutrient Peptide Serum × 2', MY: 490, SG: 155 },
  serum: { name: 'Nutrient Peptide Serum × 2', MY: 299, SG: 99 }
};
let chinese = false;
let product = 'gel';

function money(amount) {
  return (market.value === 'SG' ? 'S$' : 'RM') + amount;
}
function syncMarket() {
  const singapore = market.value === 'SG';
  for (const price of document.querySelectorAll('[data-price]')) {
    price.textContent = money(catalogue[price.dataset.price][market.value]);
  }
  byId('comparison').textContent = money(catalogue.gel[market.value] + catalogue.serum[market.value]);
  byId('delivery').textContent = singapore
    ? (chinese ? '预计 4–7 天送达 · 合资格地址可货到付款' : 'Estimated delivery: 4–7 days · COD for eligible addresses')
    : (chinese ? '预计 1–4 天送达' : 'Estimated delivery: 1–4 days');
  const quantity = product === 'gel' ? Number(quantityInput.value) : 1;
  byId('purchase-summary').textContent = catalogue[product].name + ' × ' + quantity + ' · ' + money(catalogue[product][market.value] * quantity);
  byId('cod').hidden = !singapore;
  form.elements.method[1].disabled = !singapore;
  if (!singapore) form.elements.method[0].checked = true;
}
languageButton.addEventListener('click', () => {
  chinese = !chinese;
  document.documentElement.lang = chinese ? 'zh-Hans' : 'en';
  languageButton.lang = chinese ? 'en' : 'zh-Hans';
  languageButton.textContent = chinese ? 'English' : '简体中文';
  for (const { element, english } of localized) {
    if (chinese) element.textContent = element.dataset.zh;
    else element.innerHTML = english;
  }
  for (const { image, english } of localizedImages) {
    image.alt = chinese ? image.dataset.altZh : english;
  }
  syncWhatsApp();
  syncMarket();
});
function syncWhatsApp() {
  const message = chinese ? '你好，我想了解 Sensocell 毛孔护理凝胶。' : 'Hi! I’d like to know more about Sensocell Pore Refining Gel.';
  for (const link of document.querySelectorAll('.whatsapp')) {
    link.href = 'https://wa.me/60169217867?text=' + encodeURIComponent(message);
  }
}
market.addEventListener('change', syncMarket);
for (const button of document.querySelectorAll('.order')) {
  button.addEventListener('click', () => {
    if (button.dataset.product === 'gel' && !quantityInput.reportValidity()) return;
    product = button.dataset.product;
    form.reset();
    status.textContent = '';
    syncMarket();
    modal.showModal();
  });
}
byId('close').addEventListener('click', () => modal.close());
form.addEventListener('submit', event => {
  event.preventDefault();
  const method = new FormData(form).get('method');
  status.textContent = method === 'cod' && market.value === 'SG'
    ? (chinese ? '仅供预览，没有提交新加坡货到付款订单。' : 'Singapore COD preview only. No order was placed.')
    : (chinese ? '仅供预览，没有扣款。' : 'Online payment preview only. No payment was taken.');
});
syncWhatsApp();
syncMarket();
