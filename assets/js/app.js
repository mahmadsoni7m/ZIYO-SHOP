"use strict";

/*
 * ZIYO SHOP SETTINGS
 * WhatsApp-ро бо рақами воқеии мағоза иваз кунед.
 * Формат: рамзи кишвар + рақам, бе +, фосила ва тире.
 * Мисол: 992900000000 (ин рақам танҳо намуна аст).
 */
const SHOP_CONFIG = {
  whatsappNumber: "992XXXXXXXXX",
  currency: "сомонӣ"
};

const PRODUCTS = [
  {id:1,name:"Либоси Elegant",category:"Либос",price:350,oldPrice:420,tag:"НАВ",image:"photo-1539008835657-9e8e9680c956"},
  {id:2,name:"Костюми Classic",category:"Костюм",price:480,tag:"МАҲБУБ",image:"photo-1591047139829-d91aecb6caea"},
  {id:3,name:"Либоси Black Beauty",category:"Либос",price:390,image:"photo-1566174053879-31528523f8ae"},
  {id:4,name:"Блузка Minimal",category:"Блузка",price:220,tag:"НАВ",image:"photo-1551163943-3f6a855d1153"},
  {id:5,name:"Либоси Evening",category:"Либос",price:520,image:"photo-1515886657613-9f3515b0c78f"},
  {id:6,name:"Костюми Modern",category:"Костюм",price:450,image:"photo-1483985988355-763728e1935b"},
  {id:7,name:"Блузка Premium",category:"Блузка",price:260,image:"photo-1485230895905-ec40ba36b9bc"},
  {id:8,name:"Сумка Chic",category:"Аксессуар",price:290,tag:"НАВ",image:"photo-1584917865442-de89df76afd3"}
].map(product => ({
  ...product,
  image: `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=800&q=85`
}));

const STORAGE_KEYS = {cart:"ziyo-shop-cart-v1",favorites:"ziyo-shop-favorites-v1"};
const state = {
  category:"Ҳама", search:"", sort:"featured", favoritesOnly:false,
  favorites:readStorage(STORAGE_KEYS.favorites,[]),
  cart:readStorage(STORAGE_KEYS.cart,[]),
  selectedProduct:null, selectedSize:"M", selectedColor:"Сиёҳ"
};
const $ = id => document.getElementById(id);
const money = amount => `${Number(amount).toLocaleString("ru-RU")} ${SHOP_CONFIG.currency}`;

function readStorage(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key));
    return value===null?fallback:value;
  }catch(error){return fallback;}
}
function saveStorage(){
  try{
    localStorage.setItem(STORAGE_KEYS.cart,JSON.stringify(state.cart));
    localStorage.setItem(STORAGE_KEYS.favorites,JSON.stringify(state.favorites));
  }catch(error){showToast("Нигоҳдорӣ дар ин браузер дастрас нест.");}
}
function showToast(message){
  const toast=$("toast");
  toast.textContent=message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.remove("is-visible"),2600);
}
function safeText(value){
  return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function getVisibleProducts(){
  let items=PRODUCTS.filter(product=>{
    const matchesCategory=state.category==="Ҳама"||product.category===state.category;
    const matchesSearch=(product.name+" "+product.category).toLocaleLowerCase("tg").includes(state.search.toLocaleLowerCase("tg"));
    const matchesFavorites=!state.favoritesOnly||state.favorites.includes(product.id);
    return matchesCategory&&matchesSearch&&matchesFavorites;
  });
  if(state.sort==="price-asc")items.sort((a,b)=>a.price-b.price);
  if(state.sort==="price-desc")items.sort((a,b)=>b.price-a.price);
  if(state.sort==="name")items.sort((a,b)=>a.name.localeCompare(b.name,"tg"));
  return items;
}
function renderProducts(){
  const items=getVisibleProducts();
  if(!items.length){
    $("productGrid").innerHTML='<div class="empty-results">Маҳсулот ёфт нашуд. Ҷустуҷӯ ё категорияро дигар кунед.</div>';
    return;
  }
  $("productGrid").innerHTML=items.map(product=>`
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${safeText(product.name)}" loading="lazy">
        ${product.tag?`<span class="product-tag">${safeText(product.tag)}</span>`:""}
        <button class="favorite-button ${state.favorites.includes(product.id)?"is-favorite":""}" data-favorite="${product.id}" aria-label="Илова ба дӯстдоштаҳо" aria-pressed="${state.favorites.includes(product.id)}">${state.favorites.includes(product.id)?"♥":"♡"}</button>
        <button class="quick-add" data-choose-product="${product.id}">ИНТИХОБИ АНДОЗА ↗</button>
      </div>
      <div class="product-details">
        <p class="product-category">${safeText(product.category.toUpperCase())}</p>
        <h3 class="product-name">${safeText(product.name)}</h3>
        <span class="product-price">${money(product.price)}</span>
        ${product.oldPrice?`<span class="product-old-price">${money(product.oldPrice)}</span>`:""}
      </div>
    </article>`).join("");
}
function renderCart(){
  const quantity=state.cart.reduce((sum,item)=>sum+item.quantity,0);
  $("cartCount").textContent=quantity;
  $("cartItems").innerHTML=state.cart.length?state.cart.map(item=>`
    <article class="cart-item">
      <img src="${item.image}" alt="${safeText(item.name)}">
      <div>
        <h3>${safeText(item.name)}</h3><p>${money(item.price)}</p>
        <small>Андоза: ${safeText(item.size)} · Ранг: ${safeText(item.color)}</small>
        <div class="quantity-controls">
          <button data-change-quantity="-1" data-key="${safeText(item.key)}" aria-label="Кам кардан">−</button>
          <span>${item.quantity}</span>
          <button data-change-quantity="1" data-key="${safeText(item.key)}" aria-label="Зиёд кардан">+</button>
        </div>
      </div>
      <button class="remove-item" data-remove-item="${safeText(item.key)}">Нест кардан</button>
    </article>`).join(""):'<div class="cart-empty">Сабади шумо ҳоло холӣ аст.<br>Коллексияро бинед ва маҳсулот интихоб кунед ♡</div>';
  const total=state.cart.reduce((sum,item)=>sum+item.price*item.quantity,0);
  $("cartTotal").textContent=money(total);
  saveStorage();
}
function openCart(){
  $("backdrop").classList.add("is-open");
  $("cartDrawer").classList.add("is-open");
  $("cartDrawer").setAttribute("aria-hidden","false");
  document.body.classList.add("no-scroll");
}
function closeCart(){
  $("backdrop").classList.remove("is-open");
  $("cartDrawer").classList.remove("is-open");
  $("cartDrawer").setAttribute("aria-hidden","true");
  if(!document.querySelector(".modal.is-open"))document.body.classList.remove("no-scroll");
}
function openModal(id){
  $(id).classList.add("is-open");
  document.body.classList.add("no-scroll");
}
function closeModal(id){
  $(id).classList.remove("is-open");
  if(!document.querySelector(".modal.is-open")&&!$("cartDrawer").classList.contains("is-open"))document.body.classList.remove("no-scroll");
}
function openProductModal(id){
  const product=PRODUCTS.find(item=>item.id===id);
  if(!product)return;
  state.selectedProduct=product;
  state.selectedSize="M";
  state.selectedColor="Сиёҳ";
  $("modalProductName").textContent=product.name;
  $("modalProductPrice").textContent=money(product.price);
  $("sizeOptions").innerHTML=["XS","S","M","L","XL","XXL"].map(size=>
    `<button type="button" class="size-button ${size===state.selectedSize?"is-selected":""}" data-size="${size}" aria-pressed="${size===state.selectedSize}">${size}</button>`
  ).join("");
  $("colorSelect").value=state.selectedColor;
  openModal("productModal");
}
function setCategory(category){
  state.category=category;
  state.favoritesOnly=false;
  $("showFavorites").style.color="";
  document.querySelectorAll("[data-category]").forEach(button=>button.classList.toggle("is-active",button.dataset.category===category));
  renderProducts();
}
function toggleFavorite(id){
  if(state.favorites.includes(id))state.favorites=state.favorites.filter(favoriteId=>favoriteId!==id);
  else state.favorites.push(id);
  saveStorage();
  renderProducts();
  showToast(state.favorites.includes(id)?"Ба дӯстдоштаҳо илова шуд.":"Аз дӯстдоштаҳо хориҷ шуд.");
}
function addSelectedProduct(){
  const product=state.selectedProduct;
  if(!product)return;
  const key=`${product.id}|${state.selectedSize}|${state.selectedColor}`;
  const existing=state.cart.find(item=>item.key===key);
  if(existing)existing.quantity+=1;
  else state.cart.push({...product,key,size:state.selectedSize,color:state.selectedColor,quantity:1});
  renderCart();
  closeModal("productModal");
  showToast("Маҳсулот ба сабад илова шуд.");
}
function changeQuantity(key,delta){
  const item=state.cart.find(cartItem=>cartItem.key===key);
  if(!item)return;
  item.quantity+=delta;
  if(item.quantity<=0)state.cart=state.cart.filter(cartItem=>cartItem.key!==key);
  renderCart();
}
function whatsappReady(){
  return /^\d{8,15}$/.test(SHOP_CONFIG.whatsappNumber);
}
function openWhatsApp(message){
  if(!whatsappReady()){
    showToast("Аввал рақами WhatsApp-ро дар assets/js/app.js танзим кунед.");
    return false;
  }
  const url=`https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  const opened=window.open(url,"_blank","noopener,noreferrer");
  if(!opened)window.location.href=url;
  return true;
}
function checkoutMessage(form){
  const formData=new FormData(form);
  const lines=state.cart.map(item=>`• ${item.name} | Андоза: ${item.size} | Ранг: ${item.color} | ${item.quantity} дона | ${money(item.price*item.quantity)}`);
  const total=state.cart.reduce((sum,item)=>sum+item.price*item.quantity,0);
  return [
    "Салом, ZIYO SHOP! Мехоҳам фармоиш диҳам.",
    "",
    `Ном: ${formData.get("name")}`,
    `Телефон: ${formData.get("phone")}`,
    `Суроға: ${formData.get("address")}`,
    "",
    "Маҳсулот:",
    ...lines,
    "",
    `Ҳамагӣ: ${money(total)}`,
    `Шарҳ: ${formData.get("note")||"Нест"}`,
    "",
    "Лутфан фармоишро тасдиқ кунед."
  ].join("\n");
}

$("productGrid").addEventListener("click",event=>{
  const favorite=event.target.closest("[data-favorite]");
  const choose=event.target.closest("[data-choose-product]");
  if(favorite)toggleFavorite(Number(favorite.dataset.favorite));
  if(choose)openProductModal(Number(choose.dataset.chooseProduct));
});
$("filterList").addEventListener("click",event=>{
  const button=event.target.closest("[data-category]");
  if(button)setCategory(button.dataset.category);
});
document.querySelectorAll(".collection-card").forEach(button=>button.addEventListener("click",()=>{
  setCategory(button.dataset.collection);
  $("shop").scrollIntoView({behavior:"smooth"});
}));
$("searchInput").addEventListener("input",event=>{state.search=event.target.value;renderProducts();});
$("sortSelect").addEventListener("change",event=>{state.sort=event.target.value;renderProducts();});
$("focusSearch").addEventListener("click",()=>{
  $("shop").scrollIntoView({behavior:"smooth"});
  setTimeout(()=>$("searchInput").focus(),350);
});
$("showFavorites").addEventListener("click",()=>{
  state.favoritesOnly=!state.favoritesOnly;
  state.category="Ҳама";
  $("showFavorites").style.color=state.favoritesOnly?"var(--gold)":"";
  document.querySelectorAll("[data-category]").forEach(button=>button.classList.toggle("is-active",button.dataset.category==="Ҳама"&&!state.favoritesOnly));
  renderProducts();
  $("shop").scrollIntoView({behavior:"smooth"});
  if(state.favoritesOnly&&!state.favorites.length)showToast("Ҳоло маҳсулоти дӯстдошта надоред.");
});
$("openCart").addEventListener("click",openCart);
$("closeCart").addEventListener("click",closeCart);
$("backdrop").addEventListener("click",closeCart);
$("cartItems").addEventListener("click",event=>{
  const quantityButton=event.target.closest("[data-change-quantity]");
  const removeButton=event.target.closest("[data-remove-item]");
  if(quantityButton)changeQuantity(quantityButton.dataset.key,Number(quantityButton.dataset.changeQuantity));
  if(removeButton){state.cart=state.cart.filter(item=>item.key!==removeButton.dataset.removeItem);renderCart();}
});
$("sizeOptions").addEventListener("click",event=>{
  const button=event.target.closest("[data-size]");
  if(!button)return;
  state.selectedSize=button.dataset.size;
  $("sizeOptions").querySelectorAll("[data-size]").forEach(item=>{
    const active=item===button;
    item.classList.toggle("is-selected",active);
    item.setAttribute("aria-pressed",String(active));
  });
});
$("colorSelect").addEventListener("change",event=>{state.selectedColor=event.target.value;});
$("addToCartButton").addEventListener("click",addSelectedProduct);
document.querySelectorAll("[data-close-modal]").forEach(button=>button.addEventListener("click",()=>closeModal(button.dataset.closeModal)));
document.querySelectorAll(".modal").forEach(modal=>modal.addEventListener("click",event=>{if(event.target===modal)closeModal(modal.id);}));
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"){
    closeCart();
    document.querySelectorAll(".modal.is-open").forEach(modal=>closeModal(modal.id));
    $("mainNav").classList.remove("is-open");
    $("mobileMenuButton").setAttribute("aria-expanded","false");
  }
});
$("checkoutButton").addEventListener("click",()=>{
  if(!state.cart.length){showToast("Аввал ба сабад маҳсулот илова кунед.");return;}
  closeCart();
  openModal("checkoutModal");
});
$("checkoutForm").addEventListener("submit",event=>{
  event.preventDefault();
  if(!state.cart.length){closeModal("checkoutModal");showToast("Сабад холӣ аст.");return;}
  if(openWhatsApp(checkoutMessage(event.currentTarget))){
    closeModal("checkoutModal");
    showToast("WhatsApp кушода шуд. Фармоишро он ҷо фиристед.");
  }
});
const generalMessage="Салом, ZIYO SHOP! Мехоҳам дар бораи коллексияи нав маълумот гирам.";
$("footerWhatsApp").href=whatsappReady()?`https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(generalMessage)}`:"#";
$("newsletterWhatsApp").href=whatsappReady()?`https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(generalMessage)}`:"#";
["footerWhatsApp","newsletterWhatsApp"].forEach(id=>$(id).addEventListener("click",event=>{
  if(!whatsappReady()){event.preventDefault();showToast("Аввал рақами WhatsApp-ро дар assets/js/app.js танзим кунед.");}
}));
$("mobileMenuButton").addEventListener("click",()=>{
  const open=$("mainNav").classList.toggle("is-open");
  $("mobileMenuButton").setAttribute("aria-expanded",String(open));
});
$("mainNav").querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{
  $("mainNav").classList.remove("is-open");
  $("mobileMenuButton").setAttribute("aria-expanded","false");
}));
$("currentYear").textContent=new Date().getFullYear();

renderProducts();
renderCart();
