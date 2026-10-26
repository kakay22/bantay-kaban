
export const A = {
    c: null,
    on: 0,
    m: null,
    out: null,
    f: null,
    nb: null,
    horror: null,
    horrorTimer: null,
    horrorAudio: null,
    horrorAudioStarted: false,

    // Initialize the audio engine.
    init() {
        if (!this.c) {
            const c = (this.c = new (
                window.AudioContext || window.webkitAudioContext
            )({ latencyHint: 'interactive' }))

            const m = c.createGain()
            m.gain.value = 1.8

            const compressor = c.createDynamicsCompressor()
            m.connect(compressor)
            compressor.connect(c.destination)
            this.m = m

            const out = c.createGain()
            out.gain.value = 1.3
            out.connect(c.destination)
            this.out = out

            const filter = c.createBiquadFilter()
            filter.type = 'lowpass'
            filter.frequency.value = 800
            filter.connect(m)
            this.f = filter

            // Noise buffer for scratches and clicks.
            this.nb = c.createBuffer(1, c.sampleRate, c.sampleRate)
            const data = this.nb.getChannelData(0)

            for (let i = 0; i < data.length; i++) {
                data[i] = Math.random() * 2 - 1
            }
        }

        if (this.c.state !== 'running') {
            this.c.resume()
        }
    },

    // Original ambient sound loop.
    amb() {
        if (this.on || !this.c) return

        this.on = 1
        const c = this.c

            ;[110, 164.8, 220.5, 330].forEach(freq => {
                const osc = c.createOscillator()
                const gain = c.createGain()

                osc.type = 'triangle'
                osc.frequency.value = freq
                gain.gain.value = 0.11

                osc.connect(gain)
                gain.connect(this.f)
                osc.start()
            })

        const loop = () => {
            this.scratch()
            window.setTimeout(loop, 2000 + Math.random() * 5000)
        }

        window.setTimeout(loop, 1200)
    },

    // Generate filtered noise.
    n(dur, freq, vol, type, at = 0) {
        if (!this.c || !this.nb) return

        const c = this.c

        if (c.state !== 'running') {
            c.resume()
        }

        const source = c.createBufferSource()
        const filter = c.createBiquadFilter()
        const gain = c.createGain()
        const t = c.currentTime + at

        source.buffer = this.nb
        source.playbackRate.value = 0.6 + Math.random() * 0.8

        filter.type = type
        filter.frequency.value = freq
        filter.Q.value = 1.2

        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(vol, t + dur * 0.2)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)

        source.connect(filter)
        filter.connect(gain)
        gain.connect(this.m)

        source.start(t, Math.random() * 0.5, dur + 0.05)
    },

    // Random unsettling scratches.
    scratch() {
        const count = 3 + Math.floor(Math.random() * 6)
        const base = 2400 + Math.random() * 2200

        for (let i = 0; i < count; i++) {
            this.n(
                0.05 + Math.random() * 0.08,
                base + Math.random() * 900,
                0.35 + Math.random() * 0.2,
                'bandpass',
                i * 0.09
            )
        }
    },

    // Original click sound.
    click() {
        this.tick()
    },

    tick() {
        if (!this.c || !this.nb) return

        const c = this.c

        if (c.state !== 'running') {
            c.resume()
        }

        const t = c.currentTime
        const source = c.createBufferSource()
        const filter = c.createBiquadFilter()
        const gain = c.createGain()

        source.buffer = this.nb
        source.playbackRate.value = 0.8 + Math.random() * 0.6

        filter.type = 'highpass'
        filter.frequency.value = 2800 + Math.random() * 1800

        gain.gain.setValueAtTime(1, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)

        source.connect(filter)
        filter.connect(gain)
        gain.connect(this.out)

        source.start(t, Math.random() * 0.5, 0.05)
    },

    // Photo transition sound.
    swish() {
        this.n(0.35, 1400, 0.7, 'bandpass')
    },

    // Classification stamp sound.
    stamp() {
        this.n(0.3, 300, 2, 'lowpass')
        this.n(0.12, 1800, 0.7, 'bandpass')
    },

    // Incorrect-answer sound.
    bad() {
        this.n(0.5, 350, 1.6, 'lowpass')
        this.scratch()
    },

    // Play the horror-ambiance.mp3 background track.
    startHorrorTrack() {
        if (this.horrorAudioStarted) return

        const audio = new Audio('/audio/horror-ambiance.mp3')

        audio.loop = true
        audio.volume = 0.35
        audio.preload = 'auto'

        this.horrorAudio = audio
        this.horrorAudioStarted = true

        audio.play().catch(error => {
            this.horrorAudioStarted = false
            console.warn('Could not play horror ambience:', error)
        })
    },

    // Stop the MP3 background track.
    stopHorrorTrack() {
        if (this.horrorAudio) {
            this.horrorAudio.pause()
            this.horrorAudio.currentTime = 0
            this.horrorAudio = null
        }

        this.horrorAudioStarted = false
    },

    // =========================================
    // HORROR AMBIENCE — starts during gameplay
    // =========================================

    startHorror() {
        if (!this.c || this.horror) return

        const c = this.c

        if (c.state !== 'running') {
            c.resume()
        }

        const master = c.createGain()
        master.gain.setValueAtTime(0.0001, c.currentTime)
        master.gain.linearRampToValueAtTime(0.22, c.currentTime + 3)
        master.connect(this.m)

        const voices = []

        // Deep, ominous room drone.
        const tones = [
            { freq: 43.65, type: 'sine', gain: 0.5 },
            { freq: 55, type: 'triangle', gain: 0.28 },
            { freq: 82.41, type: 'sine', gain: 0.16 },
            { freq: 110.3, type: 'triangle', gain: 0.09 }
        ]

        tones.forEach(({ freq, type, gain: volumeLevel }) => {
            const osc = c.createOscillator()
            const volume = c.createGain()
            const wobble = c.createOscillator()
            const wobbleGain = c.createGain()

            osc.type = type
            osc.frequency.value = freq
            volume.gain.value = volumeLevel

            // Slow pitch movement creates an uneasy atmosphere.
            wobble.type = 'sine'
            wobble.frequency.value = 0.12 + Math.random() * 0.18
            wobbleGain.gain.value = freq * 0.012

            wobble.connect(wobbleGain)
            wobbleGain.connect(osc.frequency)

            osc.connect(volume)
            volume.connect(master)

            osc.start()
            wobble.start()

            voices.push(osc, wobble, volume, wobbleGain)
        })

        this.horror = { master, voices }

        this.horrorTimer = window.setTimeout(
            () => this.horrorTexture(),
            1800
        )
    },

    // Occasional distant scraping and unsettling noise.
    horrorTexture() {
        if (!this.horror || !this.c) return

        const chance = Math.random()

        if (chance < 0.65) {
            this.n(
                0.7 + Math.random() * 0.8,
                500 + Math.random() * 500,
                0.035,
                'bandpass'
            )
        } else {
            this.n(
                0.15 + Math.random() * 0.2,
                1800 + Math.random() * 1800,
                0.12,
                'bandpass'
            )
        }

        this.horrorTimer = window.setTimeout(
            () => this.horrorTexture(),
            4500 + Math.random() * 6500
        )
    },

    // Stop the horror ambience when gameplay ends.
    stopHorror() {
        if (!this.c || !this.horror) return

        window.clearTimeout(this.horrorTimer)

        const c = this.c
        const sound = this.horror

        this.horror = null
        this.horrorTimer = null

        sound.master.gain.cancelScheduledValues(c.currentTime)
        sound.master.gain.setTargetAtTime(
            0.0001,
            c.currentTime,
            0.25
        )

        window.setTimeout(() => {
            sound.voices.forEach(node => {
                try {
                    node.stop()
                } catch { }

                try {
                    node.disconnect()
                } catch { }
            })

            sound.master.disconnect()
        }, 1200)
    }
}
