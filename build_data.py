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
FLAG = {
 "Mexico":"\U0001F1F2\U0001F1FD","South Africa":"\U0001F1FF\U0001F1E6","South Korea":"\U0001F1F0\U0001F1F7","Czech Republic":"\U0001F1E8\U0001F1FF",
 "Canada":"\U0001F1E8\U0001F1E6","Bosnia and Herzegovina":"\U0001F1E7\U0001F1E6","Qatar":"\U0001F1F6\U0001F1E6","Switzerland":"\U0001F1E8\U0001F1ED",
 "Brazil":"\U0001F1E7\U0001F1F7","Morocco":"\U0001F1F2\U0001F1E6","Haiti":"\U0001F1ED\U0001F1F9","Scotland":"\U0001F3F4\U000E0067\U000E0062\U000E0073\U000E0063\U000E0074\U000E007F",
 "USA":"\U0001F1FA\U0001F1F8","Paraguay":"\U0001F1F5\U0001F1FE","Australia":"\U0001F1E6\U0001F1FA","Turkey":"\U0001F1F9\U0001F1F7",
 "Germany":"\U0001F1E9\U0001F1EA","Curacao":"\U0001F1E8\U0001F1FC","Ivory Coast":"\U0001F1E8\U0001F1EE","Ecuador":"\U0001F1EA\U0001F1E8",
 "Netherlands":"\U0001F1F3\U0001F1F1","Japan":"\U0001F1EF\U0001F1F5","Sweden":"\U0001F1F8\U0001F1EA","Tunisia":"\U0001F1F9\U0001F1F3",
 "Belgium":"\U0001F1E7\U0001F1EA","Egypt":"\U0001F1EA\U0001F1EC","Iran":"\U0001F1EE\U0001F1F7","New Zealand":"\U0001F1F3\U0001F1FF",
 "Spain":"\U0001F1EA\U0001F1F8","Cape Verde":"\U0001F1E8\U0001F1FB","Saudi Arabia":"\U0001F1F8\U0001F1E6","Uruguay":"\U0001F1FA\U0001F1FE",
 "France":"\U0001F1EB\U0001F1F7","Senegal":"\U0001F1F8\U0001F1F3","Iraq":"\U0001F1EE\U0001F1F6","Norway":"\U0001F1F3\U0001F1F4",
 "Argentina":"\U0001F1E6\U0001F1F7","Algeria":"\U0001F1E9\U0001F1FF","Austria":"\U0001F1E6\U0001F1F9","Jordan":"\U0001F1EF\U0001F1F4",
 "Portugal":"\U0001F1F5\U0001F1F9","DR Congo":"\U0001F1E8\U0001F1E9","Uzbekistan":"\U0001F1FA\U0001F1FF","Colombia":"\U0001F1E8\U0001F1F4",
 "England":"\U0001F3F4\U000E0067\U000E0062\U000E0065\U000E006E\U000E0067\U000E007F","Croatia":"\U0001F1ED\U0001F1F7","Ghana":"\U0001F1EC\U0001F1ED","Panama":"\U0001F1F5\U0001F1E6",
}
# ============================================================
#  >>>> DAILY UPDATE AREA  (edit these 4 things each day) <<<<
# ============================================================
UPDATED = "16 June 2026"                 # date label shown on the site
STAGE   = "Group Stage \u00b7 Matchday 1"    # e.g. "Group Stage \u00b7 Matchday 2", "Round of 32", "Final"
# Teams that have been KNOCKED OUT (use exact names from the team list):
ELIMINATED = set()        # e.g. {"South Africa","Curacao"}
# Teams confirmed THROUGH to the next round (optional, shows a green tick):
THROUGH = set()           # e.g. {"Germany","Mexico"}
# ------------------------------------------------------------
REDCARDS = {"South Africa":2}   # team -> total red cards (tournament)
GOALS = {"Folarin Balogun":2,"Kai Havertz":2,"Jamal Musiala":1,"Alexander Isak":1,"Viktor Gyokeres":1}
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
    # reuse if already a small processed file, unless an override exists
    if p not in AVATAR_OVERRIDE and os.path.exists(dest) and os.path.getsize(dest)<600_000:
        avatar_rel[p]="avatars/"+fn; continue
    if src and os.path.exists(src) and make_avatar(src,dest):
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
 "meta":{"updated":"16 June 2026","stage":"Group Stage · Matchday 1",
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
