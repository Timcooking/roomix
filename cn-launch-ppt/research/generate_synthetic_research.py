import csv
import json
import random
from collections import Counter, defaultdict
from pathlib import Path

OUT = Path(__file__).resolve().parent
rng = random.Random(20261115)

def quota(items):
    values = []
    for value, count in items:
        values.extend([value] * count)
    rng.shuffle(values)
    return values

def pick(options):
    roll = rng.random() * sum(weight for _, weight in options)
    for value, weight in options:
        roll -= weight
        if roll <= 0:
            return value
    return options[-1][0]

def multi(options, minimum=1):
    chosen = [value for value, probability in options if rng.random() < probability]
    if len(chosen) < minimum:
        chosen.append(max(options, key=lambda item: item[1])[0])
    return chosen

cities = quota([('上海', 25), ('深圳', 25), ('杭州', 20), ('北京', 15), ('成都', 15)])
genders = quota([('女', 52), ('男', 46), ('其他/不透露', 2)])
identities = quota([
    ('稳定职场合租', 35), ('换租/改善通勤', 25), ('初来城市求职/实习', 20),
    ('在读/应届毕业生', 15), ('有房找室友', 5),
])
rows = []
for i in range(100):
    city, gender, identity = cities[i], genders[i], identities[i]
    if identity == '在读/应届毕业生':
        age = pick([('22–25 岁', 88), ('26–29 岁', 12)])
        rent_status = pick([('住校/住家，准备合租', 65), ('实习短租/当前合租', 35)])
    elif identity == '初来城市求职/实习':
        age = pick([('22–25 岁', 72), ('26–29 岁', 26), ('30–35 岁', 2)])
        rent_status = pick([('住校/住家，准备合租', 55), ('整租/短租，计划合租', 45)])
    elif identity == '有房找室友':
        age = pick([('26–29 岁', 35), ('30–35 岁', 65)])
        rent_status = '已有房源，寻找室友'
    elif identity == '稳定职场合租':
        age = pick([('22–25 岁', 12), ('26–29 岁', 52), ('30–35 岁', 36)])
        rent_status = '当前合租'
    else:
        age = pick([('22–25 岁', 15), ('26–29 岁', 50), ('30–35 岁', 35)])
        rent_status = pick([('当前合租', 70), ('整租，计划合租', 30)])

    if city in ('上海', '北京', '深圳'):
        budget = pick([('¥1,500 以下', 5), ('¥1,500–3,000', 40), ('¥3,000–4,500', 38), ('¥4,500 以上', 17)])
    else:
        budget = pick([('¥1,500 以下', 10), ('¥1,500–3,000', 52), ('¥3,000–4,500', 29), ('¥4,500 以上', 9)])
    commute = pick([('30 分钟以内', 24), ('31–45 分钟', 43), ('46–60 分钟', 23), ('60 分钟以上', 10)])
    channels = multi([
        ('小红书', 0.61), ('微信群/豆瓣', 0.46), ('朋友或同事介绍', 0.42),
        ('租房 App', 0.38), ('中介/公寓平台', 0.33), ('闲鱼', 0.28),
    ])
    pains = multi([
        ('生活习惯不合', 0.67), ('身份不实/中介冒充', 0.60), ('虚假房源/照片不符', 0.56),
        ('押金与费用不透明', 0.54), ('安全与隐私', 0.46 if gender != '女' else 0.63),
        ('两人难以共同决策', 0.37), ('沟通效率低', 0.28),
    ])
    concern_map = {
        '生活习惯不合': '最怕作息和清洁标准不同，入住后才发现长期消耗。',
        '身份不实/中介冒充': '最怕对方身份是假的，或者个人房源背后是中介。',
        '虚假房源/照片不符': '最怕照片和现场完全不是一回事，白跑还被迫换房。',
        '押金与费用不透明': '最怕退租时押金被扣，合同外又冒出服务费。',
        '安全与隐私': '最怕陌生人知道我的精确住址、公司和日常行程。',
        '两人难以共同决策': '最怕一个人看中了，另一个人始终犹豫，错过房源。',
        '沟通效率低': '最怕反复加微信、重复回答同一套生活习惯问题。',
    }
    compatibility = pick([('非常有用', 36), ('比较有用', 43), ('一般', 14), ('不太有用', 6), ('完全没用', 1)])
    if gender == '女':
        gender_pref = pick([('不限/随机', 25), ('只看同性', 38), ('优先同性', 25), ('优先或只看异性', 5), ('视房源与对象而定', 7)])
    elif gender == '男':
        gender_pref = pick([('不限/随机', 45), ('只看同性', 18), ('优先同性', 15), ('优先或只看异性', 15), ('视房源与对象而定', 7)])
    else:
        gender_pref = pick([('不限/随机', 60), ('只看同性', 5), ('优先同性', 5), ('优先或只看异性', 5), ('视房源与对象而定', 25)])
    trust_certs = multi([
        ('实名核验', 0.77), ('真人核验', 0.68),
        ('学历核验', 0.58 if identity == '在读/应届毕业生' else 0.40),
        ('职业核验', 0.57), ('房源核验', 0.83),
    ])
    privacy = pick([
        ('只显示徽章，不公开单位/学校', 43), ('公开城市/园区/行业', 31),
        ('公开完整公司/学校', 15), ('不认证也不公开', 11),
    ])
    privacy_reason = {
        '只显示徽章，不公开单位/学校': '我希望别人知道“已核验”，但不想被定位到具体工位或班级。',
        '公开城市/园区/行业': '公开到园区或行业足够判断通勤与作息，公司全名没有必要。',
        '公开完整公司/学校': '同名大厂或学校能显著提高可信度，我愿意用信息换效率。',
        '不认证也不公开': '我不愿意把职业、学历或人脸交给一个租房平台。',
    }[privacy]
    face_auth = pick([('愿意', 35), ('有说明和替代路径才愿意', 37), ('不愿意', 28)])
    cobrowse = pick([('非常愿意', 34), ('比较愿意', 39), ('一般', 17), ('不太愿意', 8), ('完全不愿意', 2)])
    exposure = pick([('愿意认证换 7 天曝光', 41), ('看奖励和隐私再决定', 25), ('不愿意', 34)])
    payment = pick([
        ('只接受免费', 46), ('¥9.9–29/次', 27), ('¥30–99/次', 15),
        ('¥100 以上/次', 4), ('只为押金/签约等保障服务付费', 8),
    ])
    ideal_flow = pick([
        ('先实名和房源核验，再看生活习惯，配对后一起筛房。', 28),
        ('先按通勤和预算筛房，再找到愿意合租的人。', 23),
        ('先完成测评，只和契合度高且认证完整的人聊。', 21),
        ('先看徽章和公开粒度，再决定是否交换联系方式。', 15),
        ('线上达成意向后，白天结伴看房并核对合同与押金。', 13),
    ])
    rows.append({
        'respondent_id': f'R{i + 1:03d}', 'city': city, 'age_group': age, 'identity': identity,
        'gender': gender, 'rent_status': rent_status, 'budget': budget, 'commute': commute,
        'channels': ';'.join(channels), 'pains': ';'.join(pains),
        'open_concern': concern_map[max(pains, key=lambda p: pains.index(p))],
        'compatibility_usefulness': compatibility, 'gender_preference': gender_pref,
        'trust_certifications': ';'.join(trust_certs), 'privacy_level': privacy,
        'open_privacy_reason': privacy_reason, 'face_auth_attitude': face_auth,
        'co_browse_willingness': cobrowse, 'exposure_incentive': exposure,
        'payment_willingness': payment, 'open_ideal_flow': ideal_flow,
    })

csv_path = OUT / '02-模拟问卷100份.csv'
with csv_path.open('w', encoding='utf-8-sig', newline='') as handle:
    writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)

def count(key):
    return dict(Counter(row[key] for row in rows))

def multi_count(key):
    counter = Counter()
    for row in rows:
        counter.update(row[key].split(';'))
    return dict(counter.most_common())

def subset_count(predicate, key):
    return dict(Counter(row[key] for row in rows if predicate(row)))

stats = {
    'n': len(rows),
    'sample': {key: count(key) for key in ['city', 'age_group', 'identity', 'gender', 'rent_status', 'budget', 'commute']},
    'channels': multi_count('channels'),
    'pains': multi_count('pains'),
    'compatibility': count('compatibility_usefulness'),
    'gender_preference': count('gender_preference'),
    'trust_certifications': multi_count('trust_certifications'),
    'privacy': count('privacy_level'),
    'face_auth': count('face_auth_attitude'),
    'co_browse': count('co_browse_willingness'),
    'exposure': count('exposure_incentive'),
    'payment': count('payment_willingness'),
    'derived': {
        'compatibility_positive': sum(1 for row in rows if row['compatibility_usefulness'] in ('非常有用', '比较有用')),
        'limited_disclosure': sum(1 for row in rows if row['privacy_level'] in ('只显示徽章，不公开单位/学校', '公开城市/园区/行业')),
        'face_open_or_conditional': sum(1 for row in rows if row['face_auth_attitude'] != '不愿意'),
        'co_browse_positive': sum(1 for row in rows if row['co_browse_willingness'] in ('非常愿意', '比较愿意')),
        'exposure_open': sum(1 for row in rows if row['exposure_incentive'] != '不愿意'),
        'any_payment': sum(1 for row in rows if row['payment_willingness'] != '只接受免费'),
    },
    'cross_tabs': {
        'female_gender_preference': subset_count(lambda row: row['gender'] == '女', 'gender_preference'),
        'student_certifications': multi_count('trust_certifications'),
        'city_budget': {city: subset_count(lambda row, c=city: row['city'] == c, 'budget') for city in sorted(set(cities))},
        'identity_co_browse': {identity: subset_count(lambda row, x=identity: row['identity'] == x, 'co_browse_willingness') for identity in sorted(set(identities))},
    },
}
(OUT / '04-stats.json').write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'rows': len(rows), 'derived': stats['derived'], 'pains': stats['pains'], 'trust': stats['trust_certifications']}, ensure_ascii=False, indent=2))
