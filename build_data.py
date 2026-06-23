#!/usr/bin/env python3
import os, shutil, json, re, unicodedata
try:
    from PIL import Image, ImageOps
    _PIL=True
except Exception:
    _PIL=False

OUT = os.path.dirname(os.path.abspath(__file__))   # the Wallchart folder
SRC = os.path.dirname(OUT)                          # the Sweepstake folder
AV  = os.path.join(OUT, "avatars")
os.makedirs(AV, exist_ok=True)
# use a clean hand-saved photo where the original crop is unusable
AVATAR_OVERRIDE = {"Tracy Meller": os.path.join(SRC, "Tracy.jpg")}

link_dirs = [
    os.path.join(SRC, "Sweepstake 2 Folder", "Links"),
    os.path.join(SRC, "sweepstake 1 Folder", "Links"),
]
def norm_key(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())
def file_key(fname):
    stem = os.path.splitext(fname)[0]
    for suf in ["_CROP","_Crop","_crop","_WEB","_Square","_square","_OUTLOOK"]:
        if stem.endswith(suf): stem = stem[:-len(suf)]
    return norm_key(stem)

filemap = {}
for d in link_dirs:
    if not os.path.isdir(d): continue
    for f in sorted(os.listdir(d)):
        if not f.lower().endswith(".jpg"): continue
        k = file_key(f)
        if k not in filemap: filemap[k] = os.path.join(d, f)

ALIAS = {
 "samhowells":"samhowell","alexcampbell":"alexchampbell",
 "alexcammack":"alexandercammak","ianbirtles":"ianbritles",
 "chrisdembinski":"chrisdebenski","tudorjitariu":"tudorjiatriu",
 "edwardwalker":"edwalker","kenquisun":"kenqiusun",
 "vickimacgregor":"vicki","georginarobledopadilla":"georginarobledo",
 "simondavis":"simondavies","stevenbarrett":"stephenbarrett",
 "chrisday":"christopherday","kitleesmith":"kittleesmith",
}
def avatar_for(name):
    k = norm_key(name); k = ALIAS.get(k,k)
    return filemap.get(k)

players = [
 ("Nicholas Jackson","Senegal","Sam Howells","Ian Birtles"),
 ("Alexander Isak","Sweden","Austin Wright","Kit Lee Smith"),
 ("Raphinha","Brazil","Erica Reeve","Douglas Paul"),
 ("Mikel Oyarzabal","Spain","Steve Reeve","Erica Reeve"),
 ("Enner Valencia","Ecuador","Mark Gorton","Ivy Yan"),
 ("Julian Alvarez","Argentina","Ozan Ibrahim","Heather Puttock"),
 ("Desire Doue","France","Noura Nassar","Austin Wright"),
 ("Antoine Semenyo","Ghana","Maria Taboada","Simon Davis"),
 ("Kenan Yildiz","Turkey","Alex Cammack","Alex Campbell"),
 ("Vinicius Junior","Brazil","Kit Lee Smith","Luca D'Amico"),
 ("Michael Olise","France","Ann Miller","Paul Thompson"),
 ("Ferran Torres","Spain","Mark Read","Emma Burton"),
 ("Jonathan David","Canada","Jai Watts","Helen Davis"),
 ("Ousmane Dembele","France","Richard Breen","Tracy Meller"),
 ("Romelu Lukaku","Belgium","Heather Puttock","Ozan Ibrahim"),
 ("Cristiano Ronaldo","Portugal","Jack Newton","Anna Au"),
 ("Memphis Depay","Netherlands","Riccardo Pellizzon","Eleanor Hargreaves"),
 ("Viktor Gyokeres","Sweden","Dan Hanna","Vicki Macgregor"),
 ("Erling Haaland","Norway","Matthew Radwan","Daniel Newman"),
 ("Cody Gakpo","Netherlands","Maxine Campbell","Andrew Tyley"),
 ("Matheus Cunha","Brazil","Holly Clarke","Lorenz Frenzen"),
 ("Christian Pulisic","USA","Simon Smithson","Joanna Pencakowski"),
 ("Marcus Rashford","England","Dzidzor Kwaku","Andrew Partridge"),
 ("Kai Havertz","Germany","John-Alexander Rudd","Bonnie Han"),
 ("Lautaro Martinez","Argentina","Stephen Barrett","Chris Day"),
 ("Jude Bellingham","England","Ben Black","Georgina Robledo Padilla"),
 ("Folarin Balogun","USA","Ben Irish","Sally Crimmins"),
 ("John McGinn","Scotland","Jay Lee","Riccardo Pellizzon"),
 ("Keito Nakamura","Japan","James Fletcher","Tudor Jitariu"),
 ("Darwin Nunez","Uruguay","Raquel Borras","Ian Lapper"),
 ("Harry Kane","England","Iaia Loppi","Sam Howells"),
 ("Scott McTominay","Scotland","John Pope","Mimi Hawley"),
 ("Mohamed Salah","Egypt","Grace Chung","Steven Barrett"),
 ("Kevin De Bruyne","Belgium","Ken Qui Sun","Stephanie Sinden"),
 ("Jamal Musiala","Germany","Daniel Newman","Jelena Peljevic"),
 ("Breel Embolo","Switzerland","Ian Birtles","Maurice Brennan"),
 ("Raul Jimenez","Mexico","Ayomide Erinle","Richard Breen"),
 ("Bruno Fernandes","Portugal","Emma Burton","Kelly Darlington"),
 ("Lamine Yamal","Spain","Paul Thompson","Toby Jeavons"),
 ("Kylian Mbappe","France","Luca D'Amico","Nicholas Mitchell"),
 ("Brenden Aaronson","USA","Maurice Brennan","Marco Tessaro"),
 ("Lionel Messi","Argentina","Lorenz Frenzen","John-Alexander Rudd"),
 ("Florian Wirtz","Germany","Kai Low","Iaia Loppi"),
 ("Luis Diaz","Colombia","Dominik Mrozinski","Chris Dembinski"),
 ("Jeremy Doku","Belgium","Edward Walker","Richard Paul"),
 ("Bukayo Saka","England","Alex Campbell","Ann Miller"),
 ("Youssef El Kaabi","Morocco","Richard Paul","Ekin Yavuz"),
 ("Neymar","Brazil","Mark Rintoul","Raquel Borras"),
]
TEAMS = [
 ("Panama","Sam Howells","Steven Barrett"),
 ("Cape Verde","Austin Wright","Jelena Peljevic"),
 ("Belgium","Erica Reeve","Kit Lee Smith"),
 ("Algeria","Steve Reeve","Chris Dembinski"),
 ("Netherlands","Mark Gorton","Paul Thompson"),
 ("Senegal","Ozan Ibrahim","Bonnie Han"),
 ("Uruguay","Noura Nassar","Ian Lapper"),
 ("Ghana","Maria Taboada","Heather Puttock"),
 ("DR Congo","Alex Cammack","Ian Birtles"),
 ("Norway","Kit Lee Smith","Lorenz Frenzen"),
 ("Scotland","Ann Miller","Andrew Partridge"),
 ("Uzbekistan","Mark Read","Ozan Ibrahim"),
 ("Tunisia","Jai Watts","Emma Burton"),
 ("Paraguay","Richard Breen","Sam Howells"),
 ("Colombia","Heather Puttock","Chris Day"),
 ("Spain","Jack Newton","Ann Miller"),
 ("Curacao","Riccardo Pellizzon","Richard Breen"),
 ("Austria","Dan Hanna","Mimi Hawley"),
 ("Brazil","Matthew Radwan","Kelly Darlington"),
 ("Japan","Maxine Campbell","Maurice Brennan"),
 ("Ivory Coast","Holly Clarke","Tudor Jitariu"),
 ("New Zealand","Simon Smithson","Douglas Paul"),
 ("Ecuador","Dzidzor Kwaku","Richard Paul"),
 ("Portugal","John-Alexander Rudd","Joanna Pencakowski"),
 ("Saudi Arabia","Stephen Barrett","Nicholas Mitchell"),
 ("Croatia","Ben Black","Marco Tessaro"),
 ("Iraq","Ben Irish","Eleanor Hargreaves"),
 ("Argentina","Jay Lee","Andrew Tyley"),
 ("South Africa","James Fletcher","Tracy Meller"),
 ("Iran","Raquel Borras","John-Alexander Rudd"),
 ("Czech Republic","Iaia Loppi","Vicki Macgregor"),
 ("Canada","John Pope","Helen Davis"),
 ("England","Grace Chung","Riccardo Pellizzon"),
 ("Jordan","Ken Qui Sun","Raquel Borras"),
 ("Australia","Daniel Newman","Anna Au"),
 ("South Korea","Ian Birtles","Iaia Loppi"),
 ("Morocco","Ayomide Erinle","Simon Davis"),
 ("Sweden","Emma Burton","Stephanie Sinden"),
 ("Egypt","Paul Thompson","Ekin Yavuz"),
 ("Germany","Luca D'Amico","Georgina Robledo Padilla"),
 ("USA","Maurice Brennan","Toby Jeavons"),
 ("Switzerland","Lorenz Frenzen","Daniel Newman"),
 ("Qatar","Kai Low","Alex Campbell"),
 ("Turkey","Dominik Mrozinski","Austin Wright"),
 ("Haiti","Edward Walker","Erica Reeve"),
 ("Bosnia and Herzegovina","Alex Campbell","Luca D'Amico"),
 ("France","Richard Paul","Sally Crimmins"),
 ("Mexico","Mark Rintoul","Ivy Yan"),
]
UNPAID = {"Mark Rintoul","Eleanor Hargreaves","Andrew Partridge","Andrew Tyley","Chris Day","Bonnie Han"}
GROUPS = {
 "A":["Mexico","South Africa","South Korea","Czech Republic"],
 "B":["Canada","Bosnia and Herzegovina","Qatar","Switzerland"],
 "C":["Brazil","Morocco","Haiti","Scotland"],
 "D":["USA","Paraguay","Australia","Turkey"],
 "E":["Germany","Curacao","Ivory Coast","Ecuador"],
 "F":["Netherlands","Japan","Sweden","Tunisia"],
 "G":["Belgium","Egypt","Iran","New Zealand"],
 "H":["Spain","Cape Verde","Saudi Arabia","Uruguay"],
 "I":["France","Senegal","Iraq","Norway"],
 "J":["Argentina","Algeria","Austria","Jordan"],
 "K":["Portugal","DR Congo","Uzbekistan","Colombia"],
 "L":["England","Croatia","Ghana","Panama"],
}
team_group = {t:g for g,ts in GROUPS.items() for t in ts}
ISO = {
 "Mexico":"mx","South Africa":"za","South Korea":"kr","Czech Republic":"cz",
 "Canada":"ca","Bosnia and Herzegovina":"ba","Qatar":"qa","Switzerland":"ch",
 "Brazil":"br","Morocco":"ma","Haiti":"ht","Scotland":"gb-sct",
 "USA":"us","Paraguay":"py","Australia":"au","Turkey":"tr",
 "Germany":"de","Curacao":"cw","Ivory Coast":"ci","Ecuador":"ec",
 "Netherlands":"nl","Japan":"jp","Sweden":"se","Tunisia":"tn",
 "Belgium":"be","Egypt":"eg","Iran":"ir","New Zealand":"nz",
 "Spain":"es","Cape Verde":"cv","Saudi Arabia":"sa","Uruguay":"uy",
 "France":"fr","Senegal":"sn","Iraq":"iq","Norway":"no",
 "Argentina":"ar","Algeria":"dz","Austria":"at","Jordan":"jo",
 "Portugal":"pt","DR Congo":"cd","Uzbekistan":"uz","Colombia":"co",
 "England":"gb-eng","Croatia":"hr","Ghana":"gh","Panama":"pa",
}
def flag_html(c):
    code=ISO.get(c)
    if not code: return "⚽"
    return ('<img class="flag" src="https://flagcdn.com/'+code+'.svg" alt="'+c+'" loading="lazy" '
            'style="height:1em;width:auto;vertical-align:-0.15em;border-radius:2px;box-shadow:0 0 1px rgba(0,0,0,.4)">')
FLAG = {c:flag_html(c) for c in ISO}
# ============================================================
#  >>>> DAILY UPDATE AREA  (edit these 4 things each day) <<<<
# ============================================================
FACT = "Lionel Messi (Lorenz Frenzen & John-Alexander Rudd) made history under the Texas lights — his brace against Austria made him the World Cup's all-time top scorer on 18 career goals, and five already this tournament keeps him firmly in the Golden Boot hunt. Erling Haaland (Matthew Radwan & Daniel Newman) matched him with a double of his own as Norway edged Senegal 3-2 to reach the last 32."   # witty fact of the day
FIXTURES = [("18:00","Portugal","Uzbekistan"),("21:00","England","Ghana"),("00:00","Panama","Croatia"),("03:00","Colombia","DR Congo")]   # today's kick-offs (UK time)
UPDATED = "23 June 2026"                 # date label shown on the site
STAGE   = "Group Stage \u00b7 Matchday 2"    # e.g. "Group Stage \u00b7 Matchday 2", "Round of 32", "Final"
# Teams that have been KNOCKED OUT (use exact names from the team list):
ELIMINATED = {"Turkey","Tunisia","Haiti"}        # e.g. {"South Africa","Curacao"}
# Teams confirmed THROUGH to the next round (optional, shows a green tick):
THROUGH = {"USA","Mexico","Germany","Spain","Argentina","France","Norway"}           # e.g. {"Germany","Mexico"}
# ------------------------------------------------------------
REDCARDS = {"South Africa":2,"Qatar":2,"Bosnia and Herzegovina":1,"Paraguay":1}   # team -> total red cards (tournament)
GOALS = {"Lionel Messi":5,"Folarin Balogun":2,"Kai Havertz":2,"Kylian Mbappe":4,"Erling Haaland":4,"Harry Kane":2,"Jamal Musiala":1,"Alexander Isak":1,"Viktor Gyokeres":1,"Vinicius Junior":2,"Breel Embolo":1,"John McGinn":1,"Jude Bellingham":1,"Marcus Rashford":1,"Luis Diaz":1,"Jonathan David":3,"Matheus Cunha":2,"Cody Gakpo":2,"Mikel Oyarzabal":2,"Lamine Yamal":1,"Mohamed Salah":1,"Ousmane Dembele":1}
# Scorers NOT drafted by anyone (shown on the board for context, can't win the office prize):
OTHER_SCORERS = []   # (per request: only show players someone drafted)
matches = [
 ("Mexico",2,"South Africa",0,"Jun 11","Quinones & Lira; South Africa down to 9 men (2 reds)"),
 ("South Korea",2,"Czech Republic",1,"Jun 11",""),
 ("USA",4,"Paraguay",1,"Jun 12","Balogun brace for the hosts"),
 ("Germany",7,"Curacao",1,"Jun 14","Havertz, Musiala, Nmecha, Schlotterbeck +"),
 ("Netherlands",2,"Japan",2,"Jun 14",""),
 ("Ivory Coast",1,"Ecuador",0,"Jun 14",""),
 ("Sweden",5,"Tunisia",1,"Jun 14","Ayari brace, Isak, Gyokeres, Svanberg"),
 ("New Zealand",2,"Iran",2,"Jun 15","Elijah Just brace for the Kiwis"),
 ("Spain",0,"Cape Verde",0,"Jun 15","Cape Verde grab a historic first WC point"),
 ("Belgium",1,"Egypt",1,"Jun 15","Salah turns provider; honours even"),
 ("Saudi Arabia",1,"Uruguay",1,"Jun 15","Maxi Araujo rescues a point for Uruguay"),
 ("France",3,"Senegal",1,"Jun 16","Mbappe brace, Barcola; he's now France's all-time top scorer"),
 ("Norway",4,"Iraq",1,"Jun 16","Haaland brace on his World Cup debut"),
 ("Argentina",3,"Algeria",0,"Jun 16","Messi hat-trick \u2014 his first at a World Cup, ties Klose's all-time record"),
 ("Austria",3,"Jordan",1,"Jun 16","Austria's first World Cup win in 36 years; Jordan WC debut"),
 ("Canada",1,"Bosnia and Herzegovina",1,"Jun 12",""),
 ("Switzerland",1,"Qatar",1,"Jun 13","Embolo penalty; Qatar level via an own goal"),
 ("Brazil",1,"Morocco",1,"Jun 13","Vinicius Jr cancels out Saibari"),
 ("Scotland",1,"Haiti",0,"Jun 13","John McGinn settles it for Scotland"),
 ("Australia",2,"Turkey",0,"Jun 13","Irankunda & Metcalfe stun Turkiye"),
 ("Portugal",1,"DR Congo",1,"Jun 17","Joao Neves opens; Wissa levels for DR Congo"),
 ("Uzbekistan",1,"Colombia",3,"Jun 17","Luis Diaz on target; Munoz & Campaz seal it"),
 ("England",4,"Croatia",2,"Jun 17","Kane brace, Bellingham & Rashford in a 6-goal thriller"),
 ("Ghana",1,"Panama",0,"Jun 17","Yirenkyi's stoppage-time winner for the Black Stars"),
 ("Czech Republic",1,"South Africa",1,"Jun 18","Sadilek's early opener cancelled by Mokoena's late penalty"),
 ("Mexico",1,"South Korea",0,"Jun 18","Luis Romo pounces on a goalkeeping blunder; Mexico top Group A"),
 ("Switzerland",4,"Bosnia and Herzegovina",1,"Jun 18","Manzambi brace, Vargas & Xhaka pen; Bosnia red card"),
 ("Canada",6,"Qatar",0,"Jun 18","Jonathan David hat-trick as Qatar finish with nine men"),
 ("Brazil",3,"Haiti",0,"Jun 19","Cunha brace and Vinicius Jr; Selecao up and running"),
 ("Morocco",1,"Scotland",0,"Jun 19","Saibari after 72 seconds — earliest winner in WC 1-0 history"),
 ("USA",2,"Australia",0,"Jun 19","Burgess OG and Freeman; USA reach the knockouts, Pulisic rested"),
 ("Paraguay",1,"Turkey",0,"Jun 19","Galarza rocket; 10-man Paraguay send Turkiye out"),
 ("Netherlands",5,"Sweden",1,"Jun 20","Brobbey & Gakpo braces, Summerville; statement Dutch win"),
 ("Germany",2,"Ivory Coast",1,"Jun 20","Undav brace off the bench, 94th-min winner; Germany reach last 32"),
 ("Ecuador",0,"Curacao",0,"Jun 20","Goalless in Group E; Curacao take another point"),
 ("Tunisia",0,"Japan",4,"Jun 20","Ueda brace, Kamada & Ito; Japan through, Tunisia out"),
 ("Spain",4,"Saudi Arabia",0,"Jun 21","Yamal opener and Oyarzabal brace inside 25 mins; Spain seal the last 32"),
 ("Uruguay",2,"Cape Verde",2,"Jun 21","Pina free-kick and Varela strike earn Cape Verde a shock second point"),
 ("Belgium",0,"Iran",0,"Jun 21","Goalless stalemate in Group G"),
 ("New Zealand",1,"Egypt",3,"Jun 21","Salah inspires Egypt to a historic first-ever World Cup win"),
 ("Argentina",2,"Austria",0,"Jun 22","Messi double — he becomes the World Cup's all-time top scorer (18) as Argentina reach the last 32"),
 ("France",3,"Iraq",0,"Jun 22","Mbappe brace and Dembele's first; France through to the knockouts"),
 ("Norway",3,"Senegal",2,"Jun 22","Haaland double sends Norway through; Sarr nets twice for Senegal"),
 ("Jordan",1,"Algeria",2,"Jun 22","Algeria win to keep their hopes alive; Jordan bow out"),
]
gf={t:0 for t,_,_ in TEAMS}; ga={t:0 for t,_,_ in TEAMS}; played={t:0 for t,_,_ in TEAMS}
for h,hg,a,ag,d,n in matches:
    gf[h]+=hg; ga[h]+=ag; gf[a]+=ag; ga[a]+=hg; played[h]+=1; played[a]+=1

all_people=set()
for _,_,o1,o2 in players: all_people.update([o1,o2])
for _,o1,o2 in TEAMS:
    if o1: all_people.add(o1)
    if o2: all_people.add(o2)
def make_avatar(src, dest):
    """Square-crop, downscale to 320px, strip alpha, save web-safe JPEG."""
    if _PIL:
        try:
            im=Image.open(src)
            im=ImageOps.exif_transpose(im)
            if im.mode!="RGB": im=im.convert("RGB")
            w,h=im.size; m=min(w,h)
            im=im.crop(((w-m)//2,(h-m)//2,(w-m)//2+m,(h-m)//2+m))
            im=im.resize((320,320), Image.LANCZOS)
            im.save(dest,"JPEG",quality=82,optimize=True)
            return True
        except Exception as e:
            print("PIL fail",src,e)
    try:
        shutil.copy(src,dest); return True
    except Exception:
        return False

avatar_rel={}; missing=[]
for p in sorted(all_people):
    src=AVATAR_OVERRIDE.get(p) or avatar_for(p)
    fn=norm_key(p)+".jpg"; dest=os.path.join(AV,fn)
    if src and os.path.exists(src):
        # original photo available locally -> (re)process it
        if make_avatar(src,dest) or os.path.exists(dest): avatar_rel[p]="avatars/"+fn
        else: avatar_rel[p]=None; missing.append(p)
    elif os.path.exists(dest):
        # running from a clean clone (no source photos) -> reuse processed avatar
        avatar_rel[p]="avatars/"+fn
    else:
        avatar_rel[p]=None; missing.append(p)
def person(name,league=None):
    d={"name":name,"avatar":avatar_rel.get(name),"paid":name not in UNPAID}
    if league: d["league"]=league
    return d
players_out=[{"player":pl,"country":c,"flag":FLAG.get(c,"⚽"),"goals":GOALS.get(pl,0),
             "owners":{"league1":person(o1),"league2":person(o2)}} for pl,c,o1,o2 in players]
teams_out=[]
for t,o1,o2 in TEAMS:
    owners=[]
    if o1: owners.append(person(o1,"L1"))
    if o2: owners.append(person(o2,"L2"))
    teams_out.append({"team":t,"flag":FLAG.get(t,"⚽"),"group":team_group.get(t,"?"),
        "owners":owners,
        "gf":gf.get(t,0),"ga":ga.get(t,0),"reds":REDCARDS.get(t,0),"played":played.get(t,0),
        "status":("out" if t in ELIMINATED else ("through" if t in THROUGH else "alive"))})
data={
 "meta":{"updated":UPDATED,"stage":STAGE,"fact":FACT,
   "note":"Group stage runs to 27 June. Top 2 of each group + 8 best 3rd-placed teams reach the Round of 32."},
 "prizes":[
   {"id":"winner","title":"World Cup Winner","emoji":"\U0001F3C6","amount":"\u00a3100","desc":"Holder of the team that lifts the trophy","metric":"team","decided":False},
   {"id":"runnerup","title":"Runner-Up (Finalists)","emoji":"\U0001F948","amount":"\u00a340","desc":"Holder of the beaten finalist","metric":"team","decided":False},
   {"id":"goldenboot","title":"Golden Boot Winner","emoji":"\U0001F45F","amount":"\u00a320","desc":"Holder of the player who wins FIFA's official Golden Boot (tournament top scorer)","metric":"player","decided":False},
   {"id":"mostgoals","title":"Team Most Goals (Groups)","emoji":"\U0001F3AF","amount":"\u00a310","desc":"Holder of the team scoring the most goals in the GROUP STAGES","metric":"team_gf","decided":False},
   {"id":"redcards","title":"Team Most Red Cards","emoji":"\U0001F7E5","amount":"\u00a310","desc":"Holder of the team shown the most red cards (tournament)","metric":"team_reds","decided":False},
   {"id":"mostconceded","title":"Team Most Goals Conceded","emoji":"\U0001F945","amount":"\u00a310","desc":"Holder of the team conceding the most goals (tournament)","metric":"team_ga","decided":False},
   {"id":"thrashing","title":"Biggest Single-Match Defeat","emoji":"\U0001F4A5","amount":"\u00a320","desc":"Holder of the team on the wrong end of the biggest single-match defeat","metric":"defeat","decided":False},
   {"id":"heroic","title":"Heroic Failure","emoji":"\U0001F9B8","amount":"\u00a320","desc":"Small team that goes far \u2014 think Cape Verde, Curacao, Jordan or Panama escaping their group (judged)","metric":"judged","decided":False},
   {"id":"goal","title":"Goal of the Tournament","emoji":"\u26a1","amount":"\u00a310","desc":"Holder of the player who scores BBC Sport's Goal of the Tournament","metric":"judged_player","decided":False},
 ],
 "matches":[{"home":h,"hg":hg,"away":a,"ag":ag,"date":d,"note":n,"homeFlag":FLAG.get(h,"⚽"),"awayFlag":FLAG.get(a,"⚽")} for h,hg,a,ag,d,n in matches],
 "otherScorers":[{"player":p,"country":c,"flag":FLAG.get(c,"⚽"),"goals":g} for p,c,g in OTHER_SCORERS],
 "fixtures":[{"time":t,"home":h,"away":a,"homeFlag":FLAG.get(h,"\u26bd"),"awayFlag":FLAG.get(a,"\u26bd"),"group":team_group.get(h,"?")} for t,h,a in FIXTURES],
 "players":players_out,"teams":teams_out,
}
with open(os.path.join(OUT,"data.js"),"w",encoding="utf-8") as f:
    f.write("// World Cup 2026 Office Sweepstake - live data. Auto-updated daily.\n")
    f.write("window.WCDATA = ")
    json.dump(data,f,ensure_ascii=False,indent=1)
    f.write(";\n")
print("players:",len(players_out),"teams:",len(teams_out),"people:",len(all_people))
print("avatars copied:",len([v for v in avatar_rel.values() if v]))
print("MISSING avatars:",missing)
