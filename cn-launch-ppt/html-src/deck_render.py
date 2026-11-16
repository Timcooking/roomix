from __future__ import annotations

import html


def e(value: object) -> str:
    return html.escape(str(value), quote=True)


def info(slide: dict) -> str:
    if not slide.get("info"):
        return ""
    tip_id = f"tip-{slide['id']}"
    return f'<span class="info-wrap tip-right"><button class="info" type="button" aria-label="查看数据口径" aria-describedby="{tip_id}">i</button><span class="tooltip" id="{tip_id}" role="tooltip">{e(slide["info"])}</span></span>'


def head(slide: dict) -> str:
    badge = f'<span class="badge slide-badge">{e(slide["badge"])}</span>' if slide.get("badge") else ""
    return f'<div class="slide-head reveal" style="--i:0"><div class="eyebrow">{e(slide["eyebrow"])}</div>{badge}<h2 class="slide-title" tabindex="-1">{e(slide["title"])}{info(slide)}</h2></div>'


def shell(slide: dict, content: str) -> str:
    return f'<section class="slide" id="slide-{slide["id"]}" data-title="{e(slide["title"])}" data-section="{e(slide["section"])}" role="group" aria-roledescription="幻灯片" aria-label="第 {slide["id"]} 页，共 18 页：{e(slide["title"])}" inert>{head(slide)}<div class="slide-content">{content}</div></section>'


def bars(items: list[dict]) -> str:
    return "".join(f'<div class="hbar"><span>{e(item["label"])}</span><div class="hbar-track"><div class="hbar-fill" style="width:{item["value"]}%"></div></div><span class="hbar-value">{item["value"]}%</span></div>' for item in items)


def phone(asset: str, class_name: str, alt: str) -> str:
    return f'<div class="phone {class_name}"><img src="@@IMG_{asset}@@" alt="{e(alt)}"></div>'


def cover(slide: dict) -> str:
    title = e(slide["title"]).replace(e(slide["accent"]), f'<em class="gradient-text">{e(slide["accent"])}</em>')
    return f'''<section class="slide cover" id="slide-1" data-title="{e(slide["title"])}" data-section="封面" role="group" aria-roledescription="幻灯片" aria-label="第 1 页，共 18 页：封面" inert>
      <header class="cover-header"><div class="brand"><span class="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#logo"/></svg></span>roomix</div><span class="cover-edition">{e(slide["edition"])}</span></header>
      <div class="cover-copy reveal"><div class="eyebrow">{e(slide["eyebrow"])}</div><h1 class="cover-title" tabindex="-1">{title}</h1><p class="cover-subtitle">{e(slide["subtitle"])}</p></div>
      <div class="cover-visual reveal" style="--i:1"><div class="cover-arch" aria-hidden="true"></div>{phone("kaylee", "cover-phone", "Roomix 室友匹配界面")}<div class="cover-room"><img src="@@IMG_living@@" alt="明亮的合租客厅"></div><div class="cover-match"><span>生活契合度</span><strong>92%</strong><small>双向匹配</small></div></div>
    </section>'''


def render(slide: dict) -> str:
    layout = slide["layout"]
    if layout == "cover":
        return cover(slide)
    if layout == "market":
        cards = "".join(f'<article class="market-card panel reveal" style="--i:{i + 1}"><span class="market-index">0{i + 1}</span><div class="metric-value market-number">{e(item["value"])}</div><div class="market-label">{e(item["label"])}</div></article>' for i, item in enumerate(slide["metrics"]))
        return shell(slide, f'<div class="market-grid">{cards}</div>')
    if layout == "trends":
        cards = "".join(f'<article class="trend-card panel reveal" style="--i:{i + 1}"><div class="metric-value trend-value">{e(item["value"])}</div><div class="trend-label">{e(item["label"])}</div><div class="trend-change">{e(item["change"])}</div></article>' for i, item in enumerate(slide["metrics"]))
        policies = "".join(f'<div class="policy-node panel reveal" style="--i:{i + 4}"><span class="policy-date">{e(item["date"])}</span><span class="policy-name">{e(item["label"])}</span></div>' for i, item in enumerate(slide["policy"]))
        return shell(slide, f'<div class="trend-grid">{cards}</div><div class="policy-line">{policies}</div>')
    if layout == "research":
        cities = "".join(f'<span class="chip">{e(item["label"])} {item["value"]}</span>' for item in slide["cities"])
        ages = "".join(f'<span style="width:{item["value"]}%" title="{e(item["label"])} {item["value"]}%"></span>' for item in slide["ages"])
        age_labels = "".join(f'<span>{e(item["label"])} {item["value"]}%</span>' for item in slide["ages"])
        left = f'<div class="sample-panel panel reveal"><div class="sample-numbers"><div class="sample-number"><strong>100</strong><span>问卷</span></div><div class="sample-number"><strong>5</strong><span>深访</span></div></div><div class="city-list">{cities}</div><div class="age-stack">{ages}</div><div class="age-labels">{age_labels}</div></div>'
        right = f'<div class="pain-panel panel reveal" style="--i:1">{bars(slide["pains"])}</div>'
        return shell(slide, f'<div class="research-grid">{left}{right}</div>')
    if layout == "trust":
        legend = "".join(f'<span class="chip">{e(item["label"])} {item["value"]}%</span>' for item in slide["privacy"])
        left = f'<div class="privacy-panel panel reveal"><div class="donut"><div class="donut-content"><strong>{slide["highlight"]["value"]}%</strong><span>{e(slide["highlight"]["label"])}</span></div></div><div class="disclosure-legend">{legend}</div><span class="badge face-chip">{slide["faceAlternative"]}% 需要非人脸替代路径</span></div>'
        right = f'<div class="cert-panel panel reveal" style="--i:1">{bars(slide["certifications"])}</div>'
        return shell(slide, f'<div class="trust-grid">{left}{right}</div>')
    if layout == "personas":
        tabs, panels = [], []
        for i, person in enumerate(slide["personas"]):
            selected = i == 0
            tabs.append(f'<button class="persona-tab reveal" style="--i:{i}" type="button" data-persona="{e(person["id"])}" aria-pressed="{str(selected).lower()}"><span class="persona-initial">{e(person["name"][0])}</span><span><strong>{e(person["name"])}</strong><small>{person["age"]} · {e(person["city"])} · {e(person["role"])}</small></span><span class="persona-arrow">→</span></button>')
            panels.append(f'<article class="persona-panel panel" data-persona-panel="{e(person["id"])}" {"" if selected else "hidden"}><div class="persona-role">{e(person["city"])} / {e(person["role"])}</div><h3 class="persona-name">{e(person["name"])}</h3><div class="persona-facts"><div class="persona-fact"><span>预算</span><strong>{e(person["budget"])}</strong></div><div class="persona-fact"><span>通勤</span><strong>{e(person["commute"])}</strong></div><div class="persona-fact"><span>偏好</span><strong>{e(person["priority"])}</strong></div></div><blockquote class="persona-quote">{e(person["quote"])}</blockquote></article>')
        return shell(slide, f'<div class="persona-layout"><div class="persona-tabs">{"".join(tabs)}</div><div>{"".join(panels)}</div></div>')
    if layout == "competition":
        points = "".join(f'<div class="competitor{" featured" if item.get("featured") else ""}" style="left:{item["x"]}%;bottom:{item["y"]}%"><span class="competitor-dot"></span><span class="competitor-name">{e(item["name"])}</span></div>' for item in slide["competitors"])
        return shell(slide, f'<div class="matrix reveal"><span class="axis-x">{e(slide["axes"]["x"])} →</span><span class="axis-y">{e(slide["axes"]["y"])} →</span>{points}</div>')
    if layout == "flow":
        buttons = "".join(f'<button class="flow-step reveal" style="--i:{i}" type="button" data-flow="{i}" data-src="@@IMG_{step["asset"]}@@" aria-pressed="{str(i == 0).lower()}"><span class="flow-number">0{i + 1}</span><span class="flow-label">{e(step["label"])}</span><span>→</span></button>' for i, step in enumerate(slide["steps"]))
        screen = f'<div class="flow-screen reveal" style="--i:1">{phone(slide["steps"][0]["asset"], "flow-phone", slide["steps"][0]["label"])}</div>'
        return shell(slide, f'<div class="flow-layout"><div class="flow-steps">{buttons}</div>{screen}</div>')
    if layout == "algorithm":
        weights = "".join(f'<div class="weight-row"><span>{e(item["label"])}</span><div class="weight-track"><div class="weight-fill" style="width:{item["value"] / 1.4 * 100:.0f}%"></div></div><span class="weight-value">{item["value"]}</span></div>' for item in slide["weights"])
        features = "".join(f'<span class="chip">{e(item)}</span>' for item in slide["features"])
        left = f'<div class="score-panel panel reveal"><div class="score-ring" style="--score:{slide["score"]}"><span class="score-value">{slide["score"]}<small>%</small></span></div><div class="feature-chips">{features}</div></div>'
        middle = f'<div class="weight-panel panel reveal" style="--i:1">{weights}</div>'
        right = f'<div class="reveal" style="--i:2;position:relative">{phone(slide["asset"], "algorithm-phone", "契合度与生活习惯详情")}</div>'
        return shell(slide, f'<div class="algorithm-layout">{left}{middle}{right}</div>')
    if layout == "mutual":
        stage = f'''<div class="mutual-stage panel reveal" id="mutual-stage" data-state="0"><img class="room-photo" src="@@IMG_livingWide@@" alt=""><div class="room-overlay"></div><div class="person-node you"><img src="@@IMG_me@@" alt="你的头像"><strong>你</strong><span class="like-state">♥</span></div><div class="room-node"><img src="@@IMG_livingWide@@" alt="明亮客厅"><strong>共同房源</strong></div><div class="person-node kaylee"><img src="@@IMG_kayleePhoto@@" alt="Kaylee 的头像"><strong>Kaylee</strong><span class="like-state">♥</span></div><div class="match-status" id="match-status">{e(slide["states"][0])}</div></div>'''
        control = f'<div class="mutual-control panel reveal" style="--i:1"><strong>2 / 2</strong><span>共同喜欢</span><button class="primary-button" id="match-action" type="button">{e(slide["action"])}</button></div>'
        return shell(slide, f'<div class="mutual-layout">{stage}{control}</div>')
    if layout == "demo":
        items = "".join(f'<article class="demo-item reveal" style="--i:{i}">{phone(item["asset"], "demo-phone", item["label"])}<span class="demo-label">{e(item["label"])}</span></article>' for i, item in enumerate(slide["gallery"]))
        return shell(slide, f'<div class="demo-gallery">{items}</div>')
    if layout == "localization":
        global_items = "".join(f'<li>{e(item)}<span class="compare-check">✓</span></li>' for item in slide["global"])
        cn_items = "".join(f'<li><span>{e(item["label"])}</span><small>{e(item["value"])}</small></li>' for item in slide["mainland"])
        return shell(slide, f'<div class="compare-grid"><section class="compare-column panel reveal"><div class="compare-heading"><h3>全球版</h3><span>HONG KONG</span></div><ul class="compare-list">{global_items}</ul></section><section class="compare-column mainland panel reveal" style="--i:1"><div class="compare-heading"><h3>中国大陆版</h3><span>+ TRUST</span></div><ul class="compare-list">{cn_items}</ul></section></div>')
    if layout == "architecture":
        columns = "".join(f'<div class="ia-column{" selected" if i == 0 else ""}" data-ia-column="{e(tab["id"])}"><button class="ia-tab reveal" style="--i:{i}" type="button" data-ia="{e(tab["id"])}" aria-pressed="{str(i == 0).lower()}">{e(tab["label"])}<span>0{i + 1}</span></button><span class="ia-line"></span><div class="ia-features">{"".join(f"<div class=\"ia-feature\">{e(feature)}</div>" for feature in tab["features"])}</div></div>' for i, tab in enumerate(slide["tabs"]))
        return shell(slide, f'<div class="ia-map">{columns}</div>')
    if layout == "verification":
        badges = "".join(f'<div class="verify-badge"><span class="verify-icon">{e(item[0])}</span>{e(item)}</div>' for item in slide["verifications"])
        tabs = "".join(f'<button class="disclosure-tab" type="button" data-disclosure="{e(item["id"])}" data-display="{e(item["display"])}" aria-pressed="{str(i == 0).lower()}">{e(item["label"])}<span>{item["value"]}%</span></button>' for i, item in enumerate(slide["disclosure"]))
        left = f'<div class="verification-left reveal"><div class="verify-badges">{badges}</div><div class="disclosure-tabs">{tabs}</div></div>'
        right = f'<div class="profile-panel panel reveal" style="--i:1"><div class="profile-card"><div class="profile-top"><span class="profile-avatar">陈</span><div><h3>陈昊</h3><span>28 · 深圳 · 产品经理</span></div></div><div class="profile-company" id="profile-company">{e(slide["disclosure"][0]["display"])}</div><div class="profile-pills"><span class="chip">实名</span><span class="chip">职业</span><span class="chip">真人</span></div></div></div>'
        return shell(slide, f'<div class="verification-layout">{left}{right}</div>')
    if layout == "roadmap":
        phases = "".join(f'<article class="phase panel reveal" style="--i:{i}"><span class="phase-period">{e(phase["period"])}</span><div class="phase-label">{e(phase["label"])}</div><ul class="phase-list">{"".join(f"<li>{e(item)}</li>" for item in phase["items"])}</ul></article>' for i, phase in enumerate(slide["phases"]))
        return shell(slide, f'<div class="roadmap">{phases}</div><div class="guardrail reveal" style="--i:3">{e(slide["guardrail"])}</div>')
    if layout == "business":
        models = "".join(f'<article class="business-card panel reveal" style="--i:{i}"><div class="business-value">{e(model["value"])}</div><div class="business-label">{e(model["label"])}</div></article>' for i, model in enumerate(slide["models"]))
        payment = f'<div class="payment-panel panel reveal" style="--i:2"><div class="payment-ring"><strong>{slide["payment"]["value"]}%</strong></div><span>{e(slide["payment"]["label"])}</span></div>'
        return shell(slide, f'<div class="business-layout"><div class="business-models">{models}</div>{payment}</div>')
    if layout == "northstar":
        funnel = []
        for i, item in enumerate(slide["funnel"]):
            if i:
                funnel.append('<span class="funnel-arrow">→</span>')
            funnel.append(f'<div class="funnel-step">{e(item)}</div>')
        metrics = "".join(f'<div class="north-metric">{e(item)}</div>' for item in slide["metrics"])
        return shell(slide, f'<div class="north-layout"><div class="funnel-panel panel reveal">{"".join(funnel)}</div><div class="north-metrics reveal" style="--i:1">{metrics}</div></div>')
    if layout == "closing":
        actions = "".join(f'<button class="{"primary-button" if action.get("primary") else "secondary-button"}" type="button" data-goto="{action["target"] - 1}">{e(action["label"])}<svg><use href="#arrow"/></svg></button>' for action in slide["actions"])
        return f'''<section class="slide closing" id="slide-18" data-title="谢谢" data-section="结束" role="group" aria-roledescription="幻灯片" aria-label="第 18 页，共 18 页：谢谢" inert><img class="closing-photo" src="@@IMG_{slide["asset"]}@@" alt="温暖明亮的居住空间"><div class="closing-copy reveal"><div class="closing-brand"><div class="brand"><span class="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#logo"/></svg></span>{e(slide["brand"])}</div></div><h2 class="closing-title" tabindex="-1">{e(slide["title"])}</h2><p class="closing-subtitle">{e(slide["subtitle"])}</p><div class="closing-actions">{actions}</div></div></section>'''
    raise ValueError(f"Unknown layout: {layout}")
