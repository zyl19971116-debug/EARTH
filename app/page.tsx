"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Heart,
  Menu,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { toast, Toaster } from "sonner";
import { usePathname, useRouter } from "next/navigation";

function Link({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

type Token = {
  name: string;
  ticker: string;
  category: string;
  cap: string;
  change: string;
  color: string;
  data: number[];
  address: string;
};
const tokens: Token[] = [
  [
    "New York City",
    "NYC",
    "North America",
    "$12.4M",
    "+128.5%",
    "#25D695",
    [12, 20, 17, 28, 25, 42, 55],
    "0xnyc",
  ],
  [
    "Los Angeles",
    "LAX",
    "North America",
    "$8.92M",
    "+86.2%",
    "#3259F5",
    [12, 15, 23, 19, 30, 39, 44],
    "0xlax",
  ],
  [
    "London",
    "LDN",
    "Europe",
    "$6.41M",
    "+42.1%",
    "#836EF9",
    [8, 18, 15, 22, 31, 29, 38],
    "0xldn",
  ],
  [
    "Berlin",
    "BER",
    "Europe",
    "$5.22M",
    "+38.7%",
    "#0052FF",
    [15, 13, 20, 26, 23, 31, 37],
    "0xber",
  ],
  [
    "Miami",
    "MIA",
    "North America",
    "$4.18M",
    "+32.6%",
    "#855DCD",
    [10, 16, 15, 23, 21, 29, 34],
    "0xmia",
  ],
  [
    "Paris",
    "PAR",
    "Europe",
    "$3.97M",
    "+28.4%",
    "#1A0C3D",
    [13, 15, 14, 22, 25, 26, 31],
    "0xpar",
  ],
  [
    "Madrid",
    "MAD",
    "Europe",
    "$3.12M",
    "+25.1%",
    "#111111",
    [8, 11, 17, 15, 20, 24, 28],
    "0xmad",
  ],
  [
    "São Paulo",
    "SAO",
    "South America",
    "$2.84M",
    "+21.3%",
    "#F5A623",
    [7, 12, 10, 16, 19, 23, 25],
    "0xsao",
  ],
].map(
  (x) =>
    ({
      name: x[0],
      ticker: x[1],
      category: x[2],
      cap: x[3],
      change: x[4],
      color: x[5],
      data: x[6],
      address: x[7],
    }) as Token,
);
const milestones = [
  {
    name: "New York · 10K Citizens",
    ticker: "NYC10K",
    cap: "$18.2M",
    change: "+156%",
    progress: 78,
  },
  {
    name: "Los Angeles · 5K Holders",
    ticker: "LAX5K",
    cap: "$9.61M",
    change: "+112%",
    progress: 86,
  },
  {
    name: "London · $1M Treasury",
    ticker: "LDN1M",
    cap: "$7.44M",
    change: "+86%",
    progress: 64,
  },
  {
    name: "Berlin · 50K Trades",
    ticker: "BER50K",
    cap: "$6.21M",
    change: "+73%",
    progress: 91,
  },
  {
    name: "São Paulo · 25K Citizens",
    ticker: "SAO25K",
    cap: "$4.18M",
    change: "+62%",
    progress: 72,
  },
];
function Logo() {
  return (
    <Link href="/" className="logo">
      <i>E</i>
      <b>
        EARTH<span>//</span>ONLINE
      </b>
    </Link>
  );
}
const walletLogos: Record<string, string> = {
  MetaMask:
    "https://images.ctfassets.net/clixtyxoaeas/1ezuBGezqfIeifWdVtwU4c/d970d4cdf13b163efddddd5709164d2e/MetaMask-icon-Fox.svg",
  Rabby: "https://raw.githubusercontent.com/RabbyHub/logo/master/avatar.svg",
  "Coinbase Wallet":
    "https://avatars.githubusercontent.com/u/1885080?s=200&v=4",
  Phantom:
    "https://mintcdn.com/phantom-e50e2e68/tU9g5MXFXgx4l6Em/resources/images/Phantom_SVG_Icon.svg",
  "OKX Wallet":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='10' fill='%23000'/%3E%3Cg fill='%23fff'%3E%3Cpath d='M8 8h9v9H8zM31 8h9v9h-9zM19.5 19.5h9v9h-9zM8 31h9v9H8zM31 31h9v9h-9z'/%3E%3C/g%3E%3C/svg%3E",
};
function WalletLogo({ name }: { name: string }) {
  return (
    <img
      className="walletlogo"
      src={walletLogos[name]}
      alt={`${name} official logo`}
    />
  );
}
function Shell({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState(false),
    [menu, setMenu] = useState(false);
  const path = usePathname(),
    router = useRouter();
  return (
    <>
      <header>
        <Logo />
        <nav className={menu ? "open" : ""}>
          {[
            ["World", "/"],
            ["Cities", "/explore"],
            ["Launch City", "/launch"],
            ["Citizen Levels", "/points"],
            ["City Rankings", "/leaderboard"],
            ["My Passport", "/profile"],
          ].map(([x, href]) => {
            return (
              <Link
                className={path === href ? "current" : ""}
                key={x}
                href={href}
                onClick={() => setMenu(false)}
              >
                {x}
              </Link>
            );
          })}
        </nav>
        <div className="actions">
          <div className="search">
            <Search size={16} />
            <input
              aria-label="Search markets"
              placeholder="Search cities and regions..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim())
                  router.push(
                    `/explore?q=${encodeURIComponent(e.currentTarget.value.trim())}`,
                  );
              }}
            />
          </div>
          <button className="dark" onClick={() => setWallet(true)}>
            <Wallet size={16} />
            <span>Connect Wallet</span>
          </button>
          <button
            className="menu"
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {children}
      <Footer />
      <Toaster richColors position="top-center" />
      {wallet && (
        <div className="modal" onClick={() => setWallet(false)}>
          <div
            className="modalbox"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="between">
              <h3>Connect a wallet</h3>
              <button
                aria-label="Close wallet dialog"
                onClick={() => setWallet(false)}
              >
                <X />
              </button>
            </div>
            <p>Choose a wallet to enter EARTH//ONLINE.</p>
            {["MetaMask", "Rabby", "Coinbase Wallet", "Phantom", "OKX Wallet"].map((w) => (
              <button
                className="walletrow"
                key={w}
                onClick={() => {
                  setWallet(false);
                  toast.success(`${w} connected (demo)`);
                }}
              >
                <WalletLogo name={w} />
                <span>{w}</span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
function Spark({ t }: { t: Token }) {
  return (
    <div className="spark">
      <ResponsiveContainer>
        <AreaChart data={t.data.map((v) => ({ v }))}>
          <Area
            dataKey="v"
            type="monotone"
            stroke={t.color}
            strokeWidth={2.2}
            fill={t.color}
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
function Card({ t }: { t: Token }) {
  const [f, setF] = useState(false);
  return (
    <Link href={`/token/${t.address}`} className="card">
      <div className="between">
        <i className="coin" style={{ background: t.color }}>
          {t.ticker[0]}
        </i>
        <button
          onClick={(e) => {
            e.preventDefault();
            setF(!f);
          }}
        >
          <Heart
            size={17}
            fill={f ? "#ff6b82" : "none"}
            color={f ? "#ff6b82" : "#98a2b3"}
          />
        </button>
      </div>
      <h3>{t.name}</h3>
      <p className="ticker">
        ${t.ticker} · {t.category}
      </p>
      <Spark t={t} />
      <div className="between">
        <div>
          <small>MARKET CAP</small>
          <b>{t.cap}</b>
        </div>
        <strong>{t.change}</strong>
      </div>
    </Link>
  );
}
function HeroArt() {
  return (
    <div className="art">
      <div className="bubble" />
      <div className="float f1">
        <small>NORTH AMERICA</small>
        <b>New York → $NYC</b>
      </div>
      <div className="float f2">
        <small>EUROPE</small>
        <b>London → $LDN</b>
      </div>
      <div className="bigcoin">
        <i>P</i>
        <small>CITIZEN LEVEL</small>
        <b>
          METROPOLITAN <em>↑</em>
        </b>
      </div>
      <div className="float mile">
        <div className="between">
          <small>MILESTONE</small>
          <b>78%</b>
        </div>
          <strong>London · 5,000 Citizens</strong>
        <div className="progress">
          <i style={{ width: "78%" }} />
        </div>
        <p>Build the city together.</p>
      </div>
    </div>
  );
}
function Home() {
  const [cat, setCat] = useState("Trending");
  const shown =
    cat === "Trending" || cat === "All"
      ? tokens
      : tokens.filter((t) => t.category === cat);
  return (
    <Shell>
      <main>
        <section className="hero">
          <div>
            <label>
              <Sparkles size={14} /> THE CITY TOKEN LAUNCHPAD
            </label>
            <h1>
              Own Your City.
              <br />
              Build Its <span>Future.</span>
            </h1>
            <h2>Launch and trade community-owned city tokens.</h2>
            <p>
              Every city becomes an onchain community. Trade city tokens, earn
              citizen status and grow a transparent treasury for local culture,
              events and community-led projects.
            </p>
            <div className="buttons">
              <Link className="dark" href="/launch">
                Launch a City <ArrowRight size={17} />
              </Link>
              <Link className="light" href="/explore">
                Explore Cities
              </Link>
            </div>
          </div>
          <HeroArt />
        </section>
        <section className="features">
          {[
            [Rocket, "Launch Any City", "One city, one community token"],
            [ShieldCheck, "Europe & Americas", "The first regions now live"],
            [Users, "50 / 50 Flywheel", "Buyback plus community building"],
          ].map(([Icon, a, b]) => (
            <div key={String(a)}>
              <i>{typeof Icon !== "string" && <Icon size={19} />}</i>
              <p>
                <b>{a as string}</b>
                <small>{b as string}</small>
              </p>
            </div>
          ))}
        </section>
        <section className="flywheel">
          <div className="flytitle">
            <label>PROTOCOL FLYWHEEL</label>
            <h2>Every fee goes back into the world.</h2>
            <p>A 1% trading fee is split automatically and transparently.</p>
          </div>
          <div className="splitcard buyback">
            <small>50% OF FEES</small>
            <strong>$EARTH Buyback</strong>
            <p>Automatically buys the main ecosystem token from the market.</p>
          </div>
          <ArrowRight className="splitarrow" />
          <div className="splitcard community">
            <small>50% OF FEES</small>
            <strong>DEV Community Wallet</strong>
            <p>Supports city events, creators, partnerships and public initiatives.</p>
          </div>
        </section>
        <section className="market">
          <div className="tabs">
            {[
              "Trending",
              "Europe",
              "North America",
              "South America",
              "Community Goals",
              "All",
            ].map((x) => (
              <button
                className={cat === x ? "active" : ""}
                onClick={() => setCat(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="regionnotice">
            <b>NOW OPEN</b> Europe · North America · South America
            <span>Asia, Africa, Middle East and Oceania are coming soon.</span>
          </div>
          <div className="sectionhead">
            <div>
              <label>LIVE CITY MARKETS</label>
              <h2>Trending Cities</h2>
              <p>
                Discover cities, join their communities and follow treasury growth.
              </p>
            </div>
            <Link href="/explore">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="markets">
            <div className="grid">
              {shown.map((t) => (
                <Card key={t.ticker} t={t} />
              ))}
            </div>
            <aside>
              <div className="asidehead">
                <span>
                  <TrendingUp />
                </span>
                <div>
                  <small>CITY GOALS</small>
                  <h3>Community milestones</h3>
                </div>
              </div>
              {milestones.map((m, i) => (
                <Link
                  href={`/token/0x${m.ticker}`}
                  className="milerow"
                  key={m.ticker}
                >
                  <i>{String(i + 1).padStart(2, "0")}</i>
                  <div>
                    <b>{m.name}</b>
                    <small>
                      ${m.ticker} · {m.cap}
                    </small>
                    <div className="progress">
                      <i style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                  <strong>{m.change}</strong>
                </Link>
              ))}
            </aside>
          </div>
        </section>
        <section className="manifesto">
          <label>EVERY TRADE BUILDS THE WORLD.</label>
          <h2>
            City tokens.
            <br />
            <span>Real communities.</span>
          </h2>
          <p>
            A transparent fee flywheel supports the main token and the people building each city.
          </p>
        </section>
        <section className="cta">
          <div>
            <label>PUT YOUR CITY ONCHAIN</label>
            <h2>
              Your City.
              <br />
              Your Movement.
            </h2>
            <p>
              Create a city token, open its market and give the community a
              transparent wallet for long-term building.
            </p>
            <Link className="dark" href="/launch?type=milestone">
              Launch Your City <ArrowRight />
            </Link>
          </div>
          <div className="ctaart">
            <i>P</i>
            <span>
              IDEA
              <br />
              COMMUNITY
              <br />
              MILESTONE
              <br />
              TO THE MOON ↗
            </span>
          </div>
        </section>
      </main>
    </Shell>
  );
}
function Launch() {
  const [type, setType] = useState("point"),
    [done, setDone] = useState(false);
  if (done)
    return (
      <Shell>
        <main className="page">
          <div className="success">
            <i>
              <Check />
            </i>
            <label>LAUNCH DRAFT READY</label>
            <h1>City Launch Created</h1>
            <p>Connect the city launch contract before publishing it onchain.</p>
            <div className="buttons">
              <Link className="dark" href="/token/0xgxp">
                View Launch
              </Link>
              <button className="light">Share on X</button>
            </div>
          </div>
        </main>
      </Shell>
    );
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="PERMISSIONLESS LAUNCH"
          title="Launch a City Token"
          text="Put any city onchain and open its community-owned market."
        />
        <div className="types">
          <button
            className={type === "point" ? "active" : ""}
            onClick={() => setType("point")}
          >
            <i>P</i>
            <b>
              CITY <small>Create a city community token</small>
            </b>
          </button>
          <button
            className={type === "milestone" ? "active" : ""}
            onClick={() => setType("milestone")}
          >
            <i>
              <TrendingUp />
            </i>
            <b>
              DISTRICT <small>Launch a neighborhood or district</small>
            </b>
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <div className="formhead">
            <div>
              <label>{type.toUpperCase()} LAUNCH</label>
              <h2>
                {type === "point"
                  ? "Configure Your City"
                  : "Configure Your District"}
              </h2>
            </div>
            <span>01 — DETAILS</span>
          </div>
          <div className="formgrid">
            <Field
              name={type === "point" ? "City Name" : "District Name"}
              placeholder={type === "point" ? "Lisbon" : "Brooklyn"}
            />
            <Field
              name="Ticker"
              placeholder={type === "point" ? "SHA" : "PDG"}
            />
            <label className="full">
              Description
              <textarea
                required
                placeholder="Describe the city community and how its treasury will be used..."
              />
            </label>
            <label>
              {type === "point" ? "Region" : "City"}
              <select>
                {[
                  "Europe",
                  "North America",
                  "South America",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <Field
              name={type === "point" ? "Total Supply" : "Population"}
              placeholder={type === "point" ? "1000000000" : "780"}
            />
            {type === "milestone" && (
              <>
                <Field name="Target Value" placeholder="1000000" />
                <label>
                  Deadline <small>Optional</small>
                  <input type="date" />
                </label>
              </>
            )}
            <Field name="Website" placeholder="https://" />
            <Field name="X / Twitter" placeholder="@handle" />
          </div>
          <div className="curvenote">
            <BarChart3 />
            <p>
              <b>Fee split enforced by contract</b>
              <small>
                50% buys back $EARTH. 50% funds the DEV community wallet.
              </small>
            </p>
            <strong>50 / 50 SPLIT</strong>
          </div>
          <button className="dark submit">
            {type === "point" ? "Launch City Token" : "Launch District"}
            <ArrowRight />
          </button>
        </form>
      </main>
    </Shell>
  );
}
function Field({ name, placeholder }: { name: string; placeholder: string }) {
  return (
    <label>
      {name}
      <input required placeholder={placeholder} />
    </label>
  );
}
function PointsProgram() {
  const tiers = [
    { name: "Visitor", amount: "1+", benefit: "City passport stamp", color: "#8D9AAA" },
    { name: "Resident", amount: "10K+", benefit: "Community proposal access", color: "#2BAE76" },
    { name: "Citizen", amount: "50K+", benefit: "Priority city events", color: "#E2A928" },
    { name: "Metropolitan", amount: "250K+", benefit: "Maximum community status", color: "#5B8CFF" },
  ];
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="YOUR ONCHAIN PASSPORT"
          title="Citizen Levels"
          text="Your identity in each city is determined by the city tokens in your wallet."
        />
        <section className="tiercards">
          {tiers.map((tier, index) => (
            <div className="tiercard" key={tier.name} style={{ "--tier": tier.color } as React.CSSProperties}>
              <span className="tiericon">{index + 1}</span>
              <small>LEVEL {index + 1}</small>
              <h2>{tier.name}</h2>
              <b>{tier.amount} tokens</b>
              <p>{tier.benefit}</p>
            </div>
          ))}
        </section>
        <section className="pointsnotes">
          <div><b>City specific</b><p>Every city token gives your wallet a separate local identity.</p></div>
          <div><b>Community access</b><p>Higher levels can unlock proposals, events and local benefits.</p></div>
          <div><b>Always current</b><p>Your passport updates automatically as your city balance changes.</p></div>
        </section>
      </main>
    </Shell>
  );
}
function Title({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="title">
      <label>{eyebrow}</label>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}
function Explore({ mile = false }: { mile?: boolean }) {
  const [sort, setSort] = useState("Trending");
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="DISCOVER"
          title={mile ? "Community Goals" : "Explore Cities"}
          text={
            mile
              ? "Track the goals city communities are building toward."
              : "Discover city tokens and join communities around the world."
          }
        />
        <div className="tabs">
          {[
            "Trending",
            mile ? "Closest to Goal" : "Newest",
            "Market Cap",
            "Volume",
            "Graduated",
          ].map((x) => (
            <button
              className={sort === x ? "active" : ""}
              onClick={() => setSort(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        {mile ? (
          <div className="milegrid">
            {[...milestones, ...milestones].map((m, i) => (
              <Link href={`/token/0xm${i}`} className="milecard" key={i}>
                <div className="between">
                  <small>#{i + 1}</small>
                  <strong>{m.progress}%</strong>
                </div>
                <h3>{m.name}</h3>
                <p>
                  ${m.ticker} · {m.cap}
                </p>
                <div className="progress">
                  <i style={{ width: `${m.progress}%` }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid explore">
            {[...tokens, ...tokens, ...tokens.slice(0, 4)]
              .flat()
              .map((t, i) => (
                <Card t={t} key={i} />
              ))}
          </div>
        )}
      </main>
    </Shell>
  );
}
function TokenPage() {
  const [side, setSide] = useState("BUY"),
    [amt, setAmt] = useState("0.5");
  const projectedHolding = Math.floor(Number(amt || 0) * 24271);
  const projectedTier = projectedHolding >= 250000 ? "Metropolitan" : projectedHolding >= 50000 ? "Citizen" : projectedHolding >= 10000 ? "Resident" : projectedHolding > 0 ? "Visitor" : "None";
  const protocolFee = Number(amt || 0) * 0.01;
  return (
    <Shell>
      <main className="page">
        <div className="tokenhead">
          <i className="coin" style={{ background: "#20A66A" }}>N</i>
          <div>
            <label>NORTH AMERICA · CITY TOKEN</label>
            <h1>
              New York City <span>$NYC</span>
            </h1>
            <p>Launched by 0x83...832 · Community wallet public</p>
          </div>
          <button className="light">
            <Heart /> Watch
          </button>
        </div>
        <div className="stats">
          {[
            ["Market Cap", "$12.4M"],
            ["Price", "$0.0412"],
            ["24H", "+128.5%"],
            ["24H Volume", "$284.9K"],
            ["Citizens", "4,821"],
            ["Community Fund", "$142.4K"],
          ].map((x) => (
            <div key={x[0]}>
              <small>{x[0]}</small>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
        <div className="tradelayout">
          <section className="chart">
            <div className="between">
              <div>
                <small>NYC / ETH</small>
                <h2>
                  $0.00412 <span>+128.5%</span>
                </h2>
              </div>
              <div className="tabs">
                {["1M", "5M", "15M", "1H", "4H", "1D"].map((x) => (
                  <button className={x === "1H" ? "active" : ""} key={x}>
                    {x}
                  </button>
                ))}
              </div>
            </div>
            <div className="bigchart">
              <ResponsiveContainer>
                <AreaChart
                  data={[
                    12, 17, 15, 24, 22, 30, 27, 38, 44, 39, 51, 58, 64, 75, 83,
                  ].map((v) => ({ v }))}
                >
                  <Area
                    dataKey="v"
                    type="monotone"
                    stroke="#5b8cff"
                    strokeWidth={3}
                    fill="#5b8cff"
                    fillOpacity={0.13}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="curve">
              <div className="between">
                <b>Bonding Curve</b>
                <strong>68%</strong>
              </div>
              <div className="progress">
                <i style={{ width: "68%" }} />
              </div>
              <small>$20,400 of $30,000 graduation market cap</small>
            </div>
          </section>
          <aside className="trade">
            <div className="tradetabs">
              <button
                className={side === "BUY" ? "active" : ""}
                onClick={() => setSide("BUY")}
              >
                BUY
              </button>
              <button
                className={side === "SELL" ? "active sell" : ""}
                onClick={() => setSide("SELL")}
              >
                SELL
              </button>
            </div>
            <label>
              You pay <small>Balance: 2.84 ETH</small>
              <div className="amount">
                <input value={amt} onChange={(e) => setAmt(e.target.value)} />
                <b>ETH</b>
              </div>
            </label>
            <div className="quick">
              {["0.1", "0.5", "1", "MAX"].map((x) => (
                <button
                  onClick={() => setAmt(x === "MAX" ? "2.84" : x)}
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
            <p className="receive">
              <small>You receive</small>
              <b>≈ {(Number(amt || 0) * 24271).toLocaleString()} NYC</b>
            </p>
            <div className="earnpreview">
              <span><Sparkles size={16} /> Projected citizen level</span>
              <strong>{projectedTier}</strong>
              <small>Based on approximately {projectedHolding.toLocaleString()} NYC held after this purchase.</small>
            </div>
            <div className="feebreakdown">
              <div><span>Protocol fee (1%)</span><b>{protocolFee.toFixed(4)} ETH</b></div>
              <div><span>50% → $EARTH buyback</span><b>{(protocolFee / 2).toFixed(4)} ETH</b></div>
              <div><span>50% → DEV community</span><b>{(protocolFee / 2).toFixed(4)} ETH</b></div>
            </div>
            <button
              className={`dark submit ${side === "SELL" ? "danger" : ""}`}
              onClick={() => toast.error("Connect the live trading contract to submit this transaction.")}
            >
              CONNECT CONTRACT TO {side} $NYC
            </button>
          </aside>
        </div>
      </main>
    </Shell>
  );
}
function Leaderboard() {
  const [tab, setTab] = useState("CITIZENS");
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="COMMUNITY SIGNAL"
          title="Leaderboard"
          text="Discover the strongest city communities and their leading citizens."
        />
        <section className="leader">
          <div className="tabs">
            {["CITIZENS", "CITIES", "FOUNDERS"].map((x) => (
              <button
                className={tab === x ? "active" : ""}
                onClick={() => setTab(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="table">
            <div className="row head">
              <span>Rank</span>
              <span>
                {tab === "CITIZENS"
                  ? "Wallet"
                  : tab === "FOUNDERS"
                    ? "Creator"
                    : "Token"}
              </span>
              <span>Holdings</span>
              <span>Level</span>
              <span>Allocation</span>
            </div>
            {Array.from({ length: 10 }, (_, i) => {
              const t = tokens[i % 8];
              return (
                <div className="row" key={i}>
                  <span>#{i + 1}</span>
                  <span className="who">
                    <i style={{ background: t.color }}>{t.ticker[0]}</i>
                    <b>
                      {tab === "CITIZENS"
                        ? `0x${83 + i}...${832 - i}`
                        : tab === "FOUNDERS"
                          ? `0x${93 + i}...${742 - i}`
                          : t.name}
                    </b>
                    <small>
                      {tab === "CITIZENS" ? `Citizen of ${t.name}` : `$${t.ticker}`}
                    </small>
                  </span>
                  <span>{(284000 - i * 13000).toLocaleString()}</span>
                  <span>{i < 2 ? "Metropolitan" : i < 5 ? "Citizen" : "Resident"}</span>
                  <strong>{(2 - i * .08).toFixed(2)}×</strong>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </Shell>
  );
}
function Profile() {
  return (
    <Shell>
      <main className="page">
        <Title
          eyebrow="EARTH PASSPORT"
          title="0x83...832"
          text="Your city holdings, citizen identities and community treasury activity."
        />
        <div className="stats">
          {[
            ["Portfolio Value", "$28.4K"],
            ["Highest Level", "Citizen"],
            ["Cities Joined", "12"],
            ["Cities Launched", "2"],
            ["Community Share", "$1,840"],
            ["Wallet Status", "Connected"],
          ].map((x) => (
            <div key={x[0]}>
              <small>{x[0]}</small>
              <b>{x[1]}</b>
            </div>
          ))}
        </div>
        <div className="grid explore">
          {tokens.slice(0, 5).map((t) => (
            <Card key={t.ticker} t={t} />
          ))}
        </div>
      </main>
    </Shell>
  );
}
function Footer() {
  return (
    <footer>
      <div>
        <Logo />
        <p>Own Your City. Build Its Future.</p>
      </div>
      <div>
        {[["Cities", "/explore"], ["Launch City", "/launch"], ["Citizen Levels", "/points"], ["City Rankings", "/leaderboard"], ["Passport", "/profile"]].map(
          ([label, href]) => <Link href={href} key={label}>{label}</Link>,
        )}
      </div>
      <div>
        City tokens for everyone<small>50% buyback · 50% community</small>
      </div>
    </footer>
  );
}
export default function App() {
  const p = usePathname();
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (tool: unknown, options?: unknown) => void;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    context.registerTool(
      {
        name: "start_token_launch",
        title: "Launch a city token",
        description:
          "Open the EARTH//ONLINE launch flow for a city or district token.",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["point", "milestone"] },
          },
          required: ["type"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input: unknown) => {
          const type = (input as { type: string }).type;
          location.href = `/launch?type=${type}`;
          return { status: "opened", type };
        },
      },
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, []);
  if (p === "/launch") return <Launch />;
  if (p === "/points") return <PointsProgram />;
  if (p === "/explore") return <Explore />;
  if (p === "/milestones") return <Explore mile />;
  if (p === "/leaderboard") return <Leaderboard />;
  if (p.startsWith("/token/")) return <TokenPage />;
  if (p.startsWith("/creator/") || p === "/profile") return <Profile />;
  return <Home />;
}
