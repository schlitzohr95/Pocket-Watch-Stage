import React, { ReactElement } from 'react';
import { StageBase, StageResponse, Message, InitialData, LoadResponse } from '@chub-ai/stages-ts';

// ── State Types ──────────────────────────────────────────────

type InitState = Record<string, never>;
type ChatState = Record<string, never>;

type MessageState = {
    day: number;
    timeOfDay: string;
    anomalyScore: number;
};

type Config = Record<string, never>;

// ── Anomaly Detection ────────────────────────────────────────

const ANOMALY_TIERS: { words: string[]; weight: number }[] = [
    { words: ['same', 'again', 'before', 'familiar', 'repeated', 'déjà', 'identical', 'exact same', 'verbatim', 'always', 'every time', 'every day'], weight: 0.3 },
    { words: ['glitch', 'freeze', 'stutter', 'loop', 'flicker', 'wrong', 'impossible', "shouldn't", 'malfunction', 'blank', 'vacant', 'off-script', 'not right', 'something off', 'something wrong'], weight: 0.7 },
    { words: ['spiral', 'underneath', 'beneath', 'tunnel', 'deeper', 'below', 'marking', 'symbol', 'carved', 'scratched', 'etched', 'notch', 'petroglyph', 'warm gold', 'gold moved'], weight: 1.2 },
    { words: ['vance', 'solomon', 'aurum', 'maintenance', 'corridor', 'infrastructure', 'composite', 'charging', 'host', 'behavioral', 'protocol', 'sector', 'elysium'], weight: 2.0 },
    { words: ['chamber', 'eighth', 'becoming', 'process', 'ancient', 'pre-human', 'predates', 'logarithmic', 'formation', 'the bottom', 'the deep'], weight: 3.0 },
];

function detectAnomalies(text: string): number {
    const lower = text.toLowerCase();
    let score = 0;
    for (const tier of ANOMALY_TIERS) {
        for (const word of tier.words) {
            const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = lower.match(regex);
            if (matches) {
                score += matches.length * tier.weight;
            }
        }
    }
    return score;
}

// ── Time Parsing ─────────────────────────────────────────────

const TIME_EMOJI_MAP: Record<string, string> = {
    '🌅': 'Morning',
    '☀️': 'Afternoon',
    '🌇': 'Evening',
    '🌙': 'Night',
};

function parseTimeHeader(text: string): { day: number; timeOfDay: string } | null {
    // Match patterns like "🌅 Day 3 — Afternoon" or "☀️ Day 1 — Morning"
    const match = text.match(/(🌅|☀️|🌇|🌙)\s*Day\s*(\d+)\s*[—\-–]\s*(\w+)/i);
    if (match) {
        return {
            day: parseInt(match[2], 10),
            timeOfDay: match[3],
        };
    }
    return null;
}

// ── Time to Angle ────────────────────────────────────────────

function timeToAngles(timeOfDay: string): { hour: number; minute: number } {
    const timeMap: Record<string, { hour: number; minute: number }> = {
        'morning': { hour: 9, minute: 0 },
        'dawn': { hour: 6, minute: 30 },
        'afternoon': { hour: 2, minute: 30 },
        'evening': { hour: 6, minute: 45 },
        'dusk': { hour: 7, minute: 15 },
        'twilight': { hour: 7, minute: 30 },
        'night': { hour: 10, minute: 0 },
    };
    const t = timeMap[timeOfDay.toLowerCase()] || { hour: 12, minute: 0 };
    const hourAngle = ((t.hour % 12) / 12) * 360 + (t.minute / 60) * 30;
    const minuteAngle = (t.minute / 60) * 360;
    return { hour: hourAngle, minute: minuteAngle };
}

// ── Pocket Watch Component ───────────────────────────────────

function PocketWatch({ day, timeOfDay, anomalyScore }: { day: number; timeOfDay: string; anomalyScore: number }) {
    const angles = timeToAngles(timeOfDay);
    const degradation = Math.min(anomalyScore / 20, 1); // 0 to 1

    // Visual effects based on degradation
    const glassOpacity = Math.max(0.05, 0.15 - degradation * 0.1);
    const crackCount = Math.floor(degradation * 5);
    const numberJitter = degradation > 0.3;
    const handTremble = degradation > 0.5 ? (Math.random() - 0.5) * degradation * 15 : 0;
    const showSpiral = degradation > 0.6;
    const faceWarp = degradation > 0.8;

    // Color shifts
    const brassColor = degradation > 0.4 ? `hsl(${40 - degradation * 20}, ${70 - degradation * 30}%, ${45 + degradation * 10}%)` : '#b8860b';
    const faceColor = degradation > 0.3 ? `hsl(${45 + degradation * 10}, ${30 - degradation * 20}%, ${92 - degradation * 15}%)` : '#f5f0e1';
    const numberColor = degradation > 0.5 ? `hsl(${20 + Math.random() * 20}, ${30 + degradation * 40}%, ${20 + degradation * 10}%)` : '#2c1810';

    const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            background: 'transparent',
            fontFamily: "'Georgia', serif",
            padding: '8px',
            boxSizing: 'border-box',
        }}>
            <svg viewBox="0 0 200 240" style={{ width: '100%', maxWidth: '280px', height: 'auto' }}>
                <defs>
                    <radialGradient id="faceGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={faceColor} />
                        <stop offset="90%" stopColor={degradation > 0.3 ? '#d4c9a8' : '#e8e0c8'} />
                        <stop offset="100%" stopColor={brassColor} />
                    </radialGradient>
                    <radialGradient id="glassGradient" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="white" stopOpacity={glassOpacity * 2} />
                        <stop offset="100%" stopColor="white" stopOpacity={0} />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    {faceWarp && (
                        <filter id="warp">
                            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="turbulence" seed={day} />
                            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale={degradation * 8} />
                        </filter>
                    )}
                </defs>

                {/* Chain loop at top */}
                <ellipse cx="100" cy="18" rx="12" ry="10" fill="none" stroke={brassColor} strokeWidth="3" />

                {/* Outer case */}
                <circle cx="100" cy="130" r="88" fill={brassColor} />
                <circle cx="100" cy="130" r="84" fill="#a67c00" />
                <circle cx="100" cy="130" r="80" fill="url(#faceGradient)"
                    filter={faceWarp ? "url(#warp)" : undefined} />

                {/* Tick marks */}
                {Array.from({ length: 60 }, (_, i) => {
                    const angle = (i / 60) * 360 - 90;
                    const rad = (angle * Math.PI) / 180;
                    const isHour = i % 5 === 0;
                    const inner = isHour ? 68 : 73;
                    const outer = 77;
                    return (
                        <line
                            key={`tick-${i}`}
                            x1={100 + inner * Math.cos(rad)}
                            y1={130 + inner * Math.sin(rad)}
                            x2={100 + outer * Math.cos(rad)}
                            y2={130 + outer * Math.sin(rad)}
                            stroke={numberColor}
                            strokeWidth={isHour ? 2 : 0.5}
                            opacity={isHour ? 1 : 0.5}
                        />
                    );
                })}

                {/* Roman numerals */}
                {romanNumerals.map((num, i) => {
                    const angle = (i / 12) * 360 - 90;
                    const rad = (angle * Math.PI) / 180;
                    const r = 62;
                    const jx = numberJitter ? (Math.sin(i * 7 + anomalyScore) * degradation * 3) : 0;
                    const jy = numberJitter ? (Math.cos(i * 5 + anomalyScore) * degradation * 3) : 0;
                    return (
                        <text
                            key={`num-${i}`}
                            x={100 + r * Math.cos(rad) + jx}
                            y={130 + r * Math.sin(rad) + jy}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={numberColor}
                            fontSize={num === 'XII' || num === 'VI' ? 10 : 8}
                            fontFamily="Georgia, serif"
                            fontWeight="bold"
                            opacity={numberJitter && Math.random() < degradation * 0.3 ? 0.3 : 1}
                        >
                            {numberJitter && Math.random() < degradation * 0.15 ? romanNumerals[(i + Math.floor(anomalyScore)) % 12] : num}
                        </text>
                    );
                })}

                {/* Day window */}
                <rect x="118" y="124" width="22" height="13" rx="2" fill="#1a1008" stroke={brassColor} strokeWidth="1" />
                <text x="129" y="133.5" textAnchor="middle" dominantBaseline="central" fill="#f5f0e1" fontSize="9" fontFamily="Georgia, serif">
                    {day > 0 ? day : '—'}
                </text>

                {/* Spiral bleedthrough */}
                {showSpiral && (
                    <g opacity={Math.min((degradation - 0.6) * 2.5, 0.6)} filter="url(#glow)">
                        <path
                            d={`M 100 130 
                                 C 100 125, 105 122, 108 125 
                                 C 112 128, 112 135, 107 138 
                                 C 102 142, 94 140, 92 134 
                                 C 89 127, 93 118, 100 116 
                                 C 108 113, 117 118, 119 126 
                                 C 122 135, 116 146, 106 148 
                                 C 96 151, 85 144, 83 134`}
                            fill="none"
                            stroke="#b8860b"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </g>
                )}

                {/* Hour hand */}
                <line
                    x1="100"
                    y1="130"
                    x2={100 + 42 * Math.sin(((angles.hour + handTremble) * Math.PI) / 180)}
                    y2={130 - 42 * Math.cos(((angles.hour + handTremble) * Math.PI) / 180)}
                    stroke="#1a1008"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                />

                {/* Minute hand */}
                <line
                    x1="100"
                    y1="130"
                    x2={100 + 58 * Math.sin(((angles.minute + handTremble * 0.7) * Math.PI) / 180)}
                    y2={130 - 58 * Math.cos(((angles.minute + handTremble * 0.7) * Math.PI) / 180)}
                    stroke="#2c1810"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* Center pin */}
                <circle cx="100" cy="130" r="4" fill={brassColor} />
                <circle cx="100" cy="130" r="2" fill="#1a1008" />

                {/* Glass reflection */}
                <circle cx="100" cy="130" r="79" fill="url(#glassGradient)" />

                {/* Cracks */}
                {crackCount >= 1 && (
                    <path d="M 130 95 L 140 110 L 135 120 L 145 135" fill="none" stroke="rgba(200,200,200,0.4)" strokeWidth="0.5" />
                )}
                {crackCount >= 2 && (
                    <path d="M 75 100 L 80 115 L 70 130" fill="none" stroke="rgba(200,200,200,0.35)" strokeWidth="0.5" />
                )}
                {crackCount >= 3 && (
                    <path d="M 110 160 L 120 150 L 130 160 L 125 170" fill="none" stroke="rgba(200,200,200,0.3)" strokeWidth="0.5" />
                )}
                {crackCount >= 4 && (
                    <path d="M 85 85 L 95 100 L 85 110 L 90 125" fill="none" stroke="rgba(200,200,200,0.4)" strokeWidth="0.7" />
                )}
                {crackCount >= 5 && (
                    <path d="M 60 130 L 75 125 L 80 140 L 65 150" fill="none" stroke="rgba(180,180,180,0.5)" strokeWidth="0.8" />
                )}

                {/* Case edge highlight */}
                <circle cx="100" cy="130" r="86" fill="none" stroke="rgba(255,220,150,0.15)" strokeWidth="1" />
            </svg>

            {/* Time label below watch */}
            <div style={{
                color: '#b8860b',
                fontSize: '12px',
                marginTop: '4px',
                textAlign: 'center',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                opacity: degradation > 0.7 ? 0.5 + Math.random() * 0.3 : 0.9,
            }}>
                {day > 0 ? `Day ${day} · ${timeOfDay}` : 'Awaiting departure'}
            </div>
        </div>
    );
}

// ── Stage Implementation ─────────────────────────────────────

class Stage extends StageBase<InitState, ChatState, MessageState, Config> {

    private day: number = 0;
    private timeOfDay: string = '';
    private anomalyScore: number = 0;

    constructor(data: InitialData<InitState, ChatState, MessageState, Config>) {
        super(data);
        if (data.messageState) {
            this.day = data.messageState.day || 0;
            this.timeOfDay = data.messageState.timeOfDay || '';
            this.anomalyScore = data.messageState.anomalyScore || 0;
        }
    }

    async load(): Promise<Partial<LoadResponse<InitState, ChatState, MessageState>>> {
        return {
            success: true,
            initState: {},
        };
    }

    async setState(state: MessageState): Promise<void> {
        if (state) {
            this.day = state.day || this.day;
            this.timeOfDay = state.timeOfDay || this.timeOfDay;
            this.anomalyScore = state.anomalyScore || this.anomalyScore;
        }
    }

    async beforePrompt(_inputMessage: Message): Promise<Partial<StageResponse<ChatState, MessageState>>> {
        return {
            stageDirections: null,
            messageState: {
                day: this.day,
                timeOfDay: this.timeOfDay,
                anomalyScore: this.anomalyScore,
            },
            modifiedMessage: null,
            systemMessage: null,
            error: null,
            chatState: null,
        };
    }

    async afterResponse(botMessage: Message): Promise<Partial<StageResponse<ChatState, MessageState>>> {
        const content = botMessage.content;

        // Parse time header
        const timeInfo = parseTimeHeader(content);
        if (timeInfo) {
            this.day = timeInfo.day;
            this.timeOfDay = timeInfo.timeOfDay;
        }

        // Detect anomalies and accumulate score
        const newAnomalies = detectAnomalies(content);
        this.anomalyScore += newAnomalies;

        return {
            stageDirections: null,
            messageState: {
                day: this.day,
                timeOfDay: this.timeOfDay,
                anomalyScore: this.anomalyScore,
            },
            modifiedMessage: null,
            systemMessage: null,
            error: null,
            chatState: null,
        };
    }

    render(): ReactElement {
        return (
            <PocketWatch
                day={this.day}
                timeOfDay={this.timeOfDay}
                anomalyScore={this.anomalyScore}
            />
        );
    }
}

export default Stage;
