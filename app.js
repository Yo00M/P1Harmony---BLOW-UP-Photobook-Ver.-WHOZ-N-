/* Fan-made P1Harmony purchasing / lottery flow simulator.
   Entirely offline: no API requests, real checkout, or real lottery participation. */
(()=>{
  'use strict';
  const MEMBERS=['KEEHO','THEO','JIUNG','INTAK','SOUL','JONGSEOB'];
  const UNIT=3900, SHIPPING=990, EVENT_DATE='2026年11月25日(水)';
  const KEY='p1h-blow-up-simulator-v1';
  const app=document.getElementById('app');
  const yen=n=>'¥'+Number(n).toLocaleString('ja-JP');
  const initial=()=>({screen:'product',expanded:{1:false,2:false},draft:{1:[],2:[]},cart:[],orders:[],payment:'card',simMode:'random',filterMember:'ALL',filterSession:'ALL',viewOrder:'ALL',filterStatus:'ALL'});
  const load=()=>{try{const data=JSON.parse(localStorage.getItem(KEY));if(data&&Array.isArray(data.cart)&&Array.isArray(data.orders))return {...initial(),...data,screen:'product',expanded:{1:false,2:false},draft:{1:[],2:[]}};}catch{}return initial();};
  let state=load();
  // Previously saved shopping cart rows didn't include selected: default to selected.
  state.cart=state.cart.map(x=>({...x,selected:x.selected!==false}));
  // Retired demo mode: fall back to random for earlier saved sessions.
  if(!['random','all-win','all-lose'].includes(state.simMode))state.simMode='random';
  const save=()=>{try{const {screen,draft,expanded,...data}=state;localStorage.setItem(KEY,JSON.stringify(data));}catch{}};
  const totalQty=lines=>lines.reduce((n,x)=>n+x.qty,0);
  const memberBadge=m=>`<span class="member-badge member-${m}">${m}</span>`;
  const cartSelected=()=>state.cart.filter(x=>x.selected);
  const cartQty=()=>totalQty(state.cart);
  function navigate(screen){if(!['product','cart','checkout','results','history'].includes(screen))return;state.screen=screen;document.getElementById('menuPanel').hidden=true;render();window.scrollTo(0,0)}
  let toastTimer;
  function toast(message){const element=document.getElementById('toast');element.textContent=message;element.classList.add('shown');clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.remove('shown'),2400)}
  const iconCart=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2 11h12l2-8H6M9 19h.02M18 19h.02" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const iconBin=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function priceLines(lines){const count=totalQty(lines);return `<div class="price-list"><div class="price-line"><span>小計</span><span>${yen(count*UNIT)}</span></div><div class="price-line"><span>配送料</span><span>${yen(count?SHIPPING:0)}</span></div><div class="price-line total"><span>合計</span><span>${yen(count*UNIT+(count?SHIPPING:0))}</span></div></div>`}
  function memberOptions(session,current){const used=state.draft[session].map(x=>x.member).filter(x=>x&&x!==current);return `<option value="" ${!current?'selected':''}>メンバーを選択してください</option>`+MEMBERS.map(m=>`<option value="${m}" ${m===current?'selected':''} ${used.includes(m)?'disabled':''}>${m}</option>`).join('')}
  function draftLines(session){return state.draft[session].map((line,index)=>`<div class="member-line"><select class="member-select" aria-label="${session}部 メンバー ${index+1}" data-change="member" data-session="${session}" data-index="${index}">${memberOptions(session,line.member)}</select>${line.member?`<div class="qty"><button data-action="draftMinus" data-session="${session}" data-index="${index}" aria-label="减一张">−</button><output>${line.qty}</output><button data-action="draftPlus" data-session="${session}" data-index="${index}" aria-label="加一张">＋</button></div><button class="member-delete" data-action="draftDelete" data-session="${session}" data-index="${index}" aria-label="移除成员">×</button>`:`<div class="qty" style="visibility:hidden"><output>1</output></div><span></span>`}</div>`).join('')}
  function validDraft(){return [1,2].flatMap(session=>state.draft[session].filter(x=>MEMBERS.includes(x.member)&&x.qty>0).map(x=>({session,member:x.member,qty:x.qty})));}
  function product(){const chosen=validDraft(),count=totalQty(chosen);return `<div class="product-kicker">P1Harmony</div>
    <h1 class="product-title">P1Harmony - BLOW UP<br>(Photobook Ver.) オンライン特典会</h1>
    <div class="product-tags"><span class="tag">#P1Harmony</span><span class="tag violet">アルバム</span><span class="tag sky">オンライン</span></div>
    <div class="delivery"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5h12v12H2zM14 9h4l4 4v4h-8M5.5 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0M16.5 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0"/></svg>2026年12月発送予定</div>
    <hr class="product-divider"><h2 class="section-heading">オプションを選択</h2>
    ${[1,2].map(session=>{const open=state.expanded[session];const rows=state.draft[session];const canAdd=rows.length<MEMBERS.length&&rows.every(r=>Boolean(r.member));return `<section class="option-card ${open?'is-open':''}"><button class="option-head" data-action="toggleSession" data-session="${session}" aria-expanded="${open}"><span>${session}部</span><span class="price">${yen(UNIT)}</span></button>${open?`<div class="option-body"><div class="option-label">メンバーを選択</div>${draftLines(session)}<button class="add-member" data-action="addMember" data-session="${session}" ${canAdd?'':'disabled'}>＋ メンバー追加</button></div>`:''}</section>`}).join('')}
    ${!count?`<p class="member-validation">オプションとメンバーを選択してください</p>`:''}
    <section class="product-summary"><div class="total-top"><span class="muted">合計 <small>${count?' '+count+'点':''}</small></span><strong>${count?yen(count*UNIT)+' <small>(税込)</small>':'—'}</strong></div>
      <div class="purchase-buttons"><button class="btn border" data-action="addCart" ${!count?'disabled':''}>${iconCart} カートに追加</button><button class="btn buy" data-action="buyNow" ${!count?'disabled':''}>ϟ 今すぐ購入</button></div></section>`}
  function cart(){const selected=cartSelected(),q=totalQty(selected);return `<h1 class="page-title">ショッピングカート</h1>${!state.cart.length?`<div class="empty"><h2>カートは空です</h2><p>まず商品ページで場次・メンバー・数量を選択してください。</p><button class="btn primary" data-nav="product">商品を見る</button></div>`:`<label class="cart-select-all"><input class="tick" type="checkbox" id="selectAll" ${state.cart.every(x=>x.selected)?'checked':''}>すべて選択</label>
    <section class="panel"><div class="cart-product"><img class="album-art" src="assets/blow-up.webp" alt="P1Harmony BLOW UP Photobook Ver. アルバム"><div class="cart-product-name">P1Harmony - BLOW UP<br>(Photobook Ver.) オンライン特典会</div></div>
    ${state.cart.map((x,index)=>`<div class="cart-line"><label class="cart-line-top"><input class="tick" type="checkbox" data-change="cartSelect" data-index="${index}" ${x.selected?'checked':''}><span>${x.session}部 · ${x.member}</span></label><div class="cart-line-sub">${yen(UNIT)}</div><div class="cart-line-controls"><div class="qty"><button data-action="cartMinus" data-index="${index}" aria-label="减少 ${x.member} 数量">−</button><output>${x.qty}</output><button data-action="cartPlus" data-index="${index}" aria-label="增加 ${x.member} 数量">＋</button></div><strong class="line-total">${yen(x.qty*UNIT)}</strong><button class="bin" data-action="cartDelete" data-index="${index}" aria-label="删除 ${x.member}">${iconBin}</button></div></div>`).join('')}</section>
    <section class="panel summary-panel"><h2>注文サマリー</h2>${priceLines(selected)}<button class="btn primary" data-action="toCheckout" ${q?'':'disabled'}>ご注文手続きへ</button></section><button class="back-link" data-nav="product">‹ 買い物を続ける / 追加購入</button>`}`}
  function checkout(){const lines=cartSelected();if(!lines.length)return `<div class="empty">選択した商品がありません。<button class="btn primary" data-nav="cart">カートに戻る</button></div>`;return `<button class="back-link" data-nav="cart">‹ 一覧に戻る</button><h1 class="page-title">ご注文内容の確認</h1>
    <section class="panel"><h2>注文商品</h2><div class="checkout-product">P1Harmony - BLOW UP (Photobook Ver.) オンライン特典会</div>${lines.map(x=>`<div class="checkout-line"><span>${x.session}部 · ${x.member}<small>${yen(UNIT)} × ${x.qty}</small></span><strong>${yen(x.qty*UNIT)}</strong></div>`).join('')}${priceLines(lines)}</section>
    <section class="panel"><h2>お支払い方法</h2>${[['card','クレジットカード'],['konbini','コンビニ決済'],['paypay','PayPay'],['paidy','Paidy（あと払い）']].map(([id,name])=>`<label class="method"><input type="radio" name="payment" value="${id}" ${state.payment===id?'checked':''}>${name}</label>`).join('')}</section>
    <section class="panel"><h2>模擬抽選の設定</h2><div class="setting-row"><label for="mode">结果模式</label><select id="mode"><option value="random" ${state.simMode==='random'?'selected':''}>随机结果（演示值 15%）</option><option value="all-win" ${state.simMode==='all-win'||state.simMode==='win'?'selected':''}>全部当选（测试用）</option><option value="all-lose" ${state.simMode==='all-lose'?'selected':''}>全部落选（测试用）</option></select></div><p class="screen-note">随机演示值与官方真实中选概率无关；可切换模式体验各种结果页面。</p></section>
    <div class="warning-note"><strong>これは購入・応募の練習用シミュレーターです。</strong><br>不会提交真实订单，不会进行真实付款，也不会生成真实签售资格。</div>
    <div class="checkout-actions"><button class="btn border" data-nav="cart">戻る</button><button class="btn primary" data-action="placeOrder">模擬注文を確定 →</button></div>`}
  function allEntries(){return state.orders.flatMap(order=>order.entries.map(e=>({...e,orderId:order.id,orderNum:order.orderNum}))).reverse()}
  function results(){const all=allEntries(),wins=all.filter(x=>x.won).length;
    const current=all.filter(x=>(state.filterMember==='ALL'||state.filterMember===x.member)&&(state.filterSession==='ALL'||String(x.session)===state.filterSession)&&(state.viewOrder==='ALL'||String(x.orderId)===String(state.viewOrder))&&(state.filterStatus==='ALL'||(state.filterStatus==='WIN' ? x.won : !x.won)));
    return `<div class="result-top"><div><h1 class="page-title">抽選結果一覧</h1><p class="subtle">${EVENT_DATE}　P1Harmony - BLOW UP (Photobook Ver.) オンライン特典会</p></div><button class="btn border" data-nav="history">注文履歴</button></div>${!all.length?`<div class="empty"><h2>抽選結果はまだありません</h2><p>完成一次模拟下单后，每张专辑都会生成一条抽选结果。</p><button class="btn primary" data-nav="product">商品ページに戻る</button></div>`:`<div class="result-stats"><button type="button" class="stat stat-filter ${state.filterStatus==='ALL'?'is-selected':''}" data-action="filterStatus" data-status="ALL" aria-pressed="${state.filterStatus==='ALL'}" title="全ての結果を見る"><span>総応募数</span><strong>${all.length}</strong></button><button type="button" class="stat stat-filter ${state.filterStatus==='WIN'?'is-selected':''}" data-action="filterStatus" data-status="WIN" aria-pressed="${state.filterStatus==='WIN'}" title="全ての当選結果を見る"><span>当選</span><strong style="color:#009c6d">${wins}</strong></button><button type="button" class="stat stat-filter ${state.filterStatus==='LOSE'?'is-selected':''}" data-action="filterStatus" data-status="LOSE" aria-pressed="${state.filterStatus==='LOSE'}" title="全ての落選結果を見る"><span>落選</span><strong style="color:#d85a62">${all.length-wins}</strong></button></div>
    <div class="filters"><select id="filterMember" aria-label="选择成员"><option value="ALL">全メンバー</option>${MEMBERS.map(m=>`<option value="${m}" ${state.filterMember===m?'selected':''}>${m}</option>`).join('')}</select><select id="filterSession" aria-label="选择场次"><option value="ALL">全ての部</option>${[1,2].map(n=>`<option value="${n}" ${String(state.filterSession)===String(n)?'selected':''}>${n}部</option>`).join('')}</select><select id="viewOrder" aria-label="筛选订单"><option value="ALL">全注文</option>${[...state.orders].reverse().map(o=>`<option value="${o.id}" ${String(state.viewOrder)===String(o.id)?'selected':''}>注文 #${o.orderNum}</option>`).join('')}</select></div>
    <p class="subtle">${current.length}件の結果 · 每张专辑独立显示</p>
    ${current.map(e=>`<section class="result-card"><div class="result-card-header"><span class="online-mark">▣ オンライン</span><span class="status ${e.won?'win':'lose'}">${e.won?'発行済み / 当選':'落選'}</span></div><div class="result-label">${e.session}部 オンライン個別サイン会</div>${memberBadge(e.member)}<div class="result-date">${EVENT_DATE}</div><div class="result-description">P1Harmony - BLOW UP (Photobook Ver.) オンライン特典会</div><p class="screen-note">注文 #${e.orderNum} · 応募 ${e.entryNo}</p></section>`).join('')||'<div class="empty">此筛选条件下没有模拟结果。</div>'}
    <div class="end-actions"><button class="btn primary" data-action="newOrder">＋ 追加注文 / 再下一单</button><button class="btn border" data-nav="history">注文履歴を見る</button></div><p class="screen-note">这里所有的当选/落选都只是网站模拟生成，不具备任何真实效力。</p>`}`}
  function history(){const orders=[...state.orders].reverse();return `<h1 class="page-title">注文履歴</h1><p class="subtle">本浏览器的模拟订单记录；每笔订单均单独计算 ¥990 配送费。</p>${!orders.length?`<div class="empty"><h2>注文はまだありません</h2><button class="btn primary" data-nav="product">商品ページに戻る</button></div>`:`<div class="result-stats"><div class="stat"><span>注文回数</span><strong>${orders.length}</strong></div><div class="stat"><span>購入枚数</span><strong>${orders.reduce((n,o)=>n+o.entries.length,0)}</strong></div><div class="stat"><span>支払総額（模擬）</span><strong style="font-size:17px">${yen(orders.reduce((n,o)=>n+o.total,0))}</strong></div></div>${orders.map(o=>`<div class="order-card"><div class="order-heading"><div><strong>注文 #${o.orderNum}</strong><br><small>${new Date(o.placed).toLocaleString('ja-JP')}</small></div><span class="subtle">${o.entries.length}枚</span></div><div class="order-lines">${o.lines.map(line=>`<div class="order-item"><span>${line.session}部</span>${memberBadge(line.member)}<span>× ${line.qty}</span></div>`).join('')}</div><div class="order-bottom"><strong>${yen(o.total)}</strong><button class="text-button" data-action="showOrder" data-id="${o.id}">抽選結果を見る →</button></div></div>`).join('')}<div class="end-actions"><button class="btn primary" data-action="newOrder">＋ 追加注文</button><button class="btn border" data-nav="results">抽選結果一覧</button></div><button class="text-button" data-action="clearOrders">すべての模擬注文を削除</button>`}`}
  function render(){const fn={product,cart,checkout,results,history}[state.screen]||product;app.innerHTML=fn();const badge=document.getElementById('cartBadge');const qty=cartQty();badge.hidden=!qty;badge.textContent=qty>99?'99+':qty;save()}
  function addToCart(){const lines=validDraft();if(!lines.length){toast('先选择场次与成员');return false}const count=totalQty(lines);if(count+cartQty()>500){toast('演示网站每单最多 500 张');return false}lines.forEach(line=>{const match=state.cart.find(x=>x.member===line.member&&x.session===line.session);if(match){match.qty+=line.qty;match.selected=true}else state.cart.push({...line,selected:true})});state.draft={1:[],2:[]};state.expanded={1:false,2:false};return true}
  function random(){if(window.crypto&&window.crypto.getRandomValues){const v=new Uint32Array(1);window.crypto.getRandomValues(v);return v[0]/4294967296}return Math.random()}
  function placeOrder(){const lines=cartSelected();if(!lines.length)return navigate('cart');const entries=[];let i=0;for(const line of lines){for(let n=0;n<line.qty;n++){i++;const m=state.simMode;const won=m==='all-win'||m==='win'?true:m==='all-lose'||m==='lose'?false:random()<0.15;entries.push({member:line.member,session:line.session,won,entryNo:i})}}const orderNum=String(state.orders.length+1).padStart(3,'0');const id=Date.now()+'-'+Math.floor(random()*1e7);state.orders.push({id,orderNum,placed:new Date().toISOString(),lines:lines.map(x=>({...x})),entries,total:entries.length*UNIT+SHIPPING,method:state.payment,simMode:state.simMode});state.cart=state.cart.filter(x=>!x.selected);state.viewOrder=id;state.filterMember='ALL';state.filterSession='ALL';state.filterStatus='ALL';navigate('results');toast('模擬注文 #'+orderNum+' 完成！')}
  document.addEventListener('click',event=>{
    const nav=event.target.closest('[data-nav]');if(nav){navigate(nav.dataset.nav);return}
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action,session=Number(button.dataset.session),index=Number(button.dataset.index);
    if(action==='menu'){document.getElementById('menuPanel').hidden=!document.getElementById('menuPanel').hidden;return}
    if(action==='toggleSession'){state.expanded[session]=!state.expanded[session];if(state.expanded[session]&&!state.draft[session].length)state.draft[session]=[{member:'',qty:1}];if(!state.expanded[session])state.draft[session]=[];render();return}
    if(action==='addMember'){if(state.draft[session].length>=MEMBERS.length||state.draft[session].some(x=>!x.member))return;state.draft[session].push({member:'',qty:1});render();return}
    if(action==='draftDelete'){state.draft[session].splice(index,1);if(!state.draft[session].length)state.draft[session].push({member:'',qty:1});render();return}
    if(action==='draftMinus'||action==='draftPlus'){const r=state.draft[session][index];if(r)r.qty=Math.max(1,Math.min(500,r.qty+(action==='draftPlus'?1:-1)));render();return}
    if(action==='addCart'){if(addToCart()){navigate('cart');toast('カートに追加しました')}return}
    if(action==='buyNow'){if(addToCart())navigate('checkout');return}
    if(action==='cartPlus'||action==='cartMinus'){const r=state.cart[index];if(r)r.qty=Math.max(1,Math.min(500,r.qty+(action==='cartPlus'?1:-1)));render();return}
    if(action==='cartDelete'){state.cart.splice(index,1);render();return}
    if(action==='toCheckout'){if(cartSelected().length)navigate('checkout');return}
    if(action==='placeOrder'){placeOrder();return}
    if(action==='filterStatus'){state.filterStatus=button.dataset.status;state.filterMember='ALL';state.filterSession='ALL';state.viewOrder='ALL';render();return}
    if(action==='newOrder'){state.viewOrder='ALL';navigate('product');return}
    if(action==='showOrder'){state.viewOrder=button.dataset.id;state.filterMember='ALL';state.filterSession='ALL';state.filterStatus='ALL';navigate('results');return}
    if(action==='clearOrders'){if(confirm('所有模拟订单和抽选结果将从此浏览器删除。确定继续？')){state.orders=[];state.viewOrder='ALL';render();toast('已删除全部模拟订单')}return}
  });
  document.addEventListener('change',event=>{
    const el=event.target;
    if(el.dataset.change==='member'){const session=Number(el.dataset.session),index=Number(el.dataset.index),value=el.value;if(value&&state.draft[session].some((x,i)=>i!==index&&x.member===value)){toast('同一场次此成员已被选择');render();return}state.draft[session][index].member=value;render();return}
    if(el.dataset.change==='cartSelect'){const r=state.cart[Number(el.dataset.index)];if(r)r.selected=el.checked;render();return}
    if(el.id==='selectAll'){state.cart.forEach(x=>x.selected=el.checked);render();return}
    if(el.name==='payment'){state.payment=el.value;save();return}
    if(el.id==='mode'){state.simMode=el.value;save();return}
    if(el.id==='filterMember'){state.filterMember=el.value;render();return}
    if(el.id==='filterSession'){state.filterSession=el.value;render();return}
    if(el.id==='viewOrder'){state.viewOrder=el.value;render();return}
  });
  render();
})();
