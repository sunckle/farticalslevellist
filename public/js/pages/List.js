import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
<main v-else class="page-list">

    <div class="list-container">

<div
    class="featured-level"
    @click="selected = featuredIndex"
>

    <div class="featured-title">
        Daily Level
    </div>

    <h2>{{ list?.[featuredIndex]?.[0]?.name }}</h2>

    <p>
        Verified by
        {{ list?.[featuredIndex]?.[0]?.verifier }}
    </p>

</div>

        <div class="search-box">
            <input
                v-model="search"
                type="text"
                placeholder="🔍 Search levels..."
            >
        </div>

        <table class="list" v-if="filteredList.length">

            <tr
                v-for="([level, err], i) in filteredList"
                :key="level?.id || i"
            >

                <td class="rank">
                    <p v-if="i + 1 <= 50" class="type-label-lg">
                        #{{ i + 1 }}
                    </p>

                    <p v-else class="type-label-lg">
                        Legacy
                    </p>
                </td>

                <td
                    class="level"
                    :class="{ active: selected == i, error: !level }"
                >

                    <button @click="selected = i">

                        <span class="type-label-lg">
                            {{ level?.name || ('Error (' + err + '.json)') }}
                        </span>

                    </button>

                </td>

            </tr>

        </table>

    </div>

            <div class="level-container">

                <transition name="page" mode="out-in">

                    <div class="level" v-if="level" :key="selected">

                        <h1>{{ level.name }}</h1>

                        <LevelAuthors
                            :author="level.author"
                            :creators="level.creators"
                            :verifier="level.verifier">
                        </LevelAuthors>

                        <div v-if="!currentGalleryImage">

    <iframe
        class="video"
        id="videoframe"
        :src="video"
        frameborder="0">
    </iframe>

</div>

<div v-else>

    <img
        :src="currentGalleryImage"
        class="gallery-preview"
        @click="currentGalleryImage = ''"
        alt="Screenshot"
    >

</div>

<div class="gallery-thumbnails">

    <img
        v-for="image in level.screenshots"
        :key="image"
        :src="'/photos/' + image"
        class="gallery-image"
        @click="currentGalleryImage = '/photos/' + image"
        alt="Screenshot"
    >

</div>

                        <ul class="stats">
                            <li>
                                <div class="type-title-sm">
                                    Points when completed
                                </div>
                                <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                            </li>

                            <li>
                                <div class="type-title-sm">ID</div>
                                <p>{{ level.id }}</p>
                            </li>

                            <li>
                                <div class="type-title-sm">Password</div>
                                <p>{{ level.password || 'Free to Copy' }}</p>
                            </li>
                        </ul>

                        <h2>Records</h2>

                        <p v-if="selected + 1 <= 75">
                            <strong>{{ level.percentToQualify }}%</strong>
                            or better to qualify
                        </p>

                        <p v-else-if="selected + 1 <= 150">
                            <strong>100%</strong>
                            or better to qualify
                        </p>

                        <p v-else>
                            This level does not accept new records.
                        </p>

                        <table class="records">

                            <tr
                                v-for="record in level.records"
                                class="record">

                                <td class="percent">
                                    <p>{{ record.percent }}%</p>
                                </td>

                                <td class="user">
                                    <a
                                        :href="record.link"
                                        target="_blank"
                                        class="type-label-lg">

                                        {{ record.user }}

                                    </a>
                                </td>

                                <td class="mobile">
                                    <img
                                        v-if="record.mobile"
                                        :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`"
                                        alt="Mobile">
                                </td>

                                <td class="hz">
                                    <p>{{ record.hz }}Hz</p>
                                </td>

                            </tr>

                        </table>

                    </div>

<div
    v-else
    class="level"
    style="height:100%;justify-content:center;align-items:center;"
>
    <p></p>
</div>

</transition>
            </div>

            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>

                    <div class="og">
                        <p class="type-label-md">
                            Website layout made by
                            <a href="https://tsl.pages.dev/" target="_blank">
                                TheShittyList
                            </a>
                        </p>
                    </div>

                    <template v-if="editors">
                        <h3>List Editors</h3>

                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img
                                    :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`"
                                    :alt="editor.role"
                                />

                                <a
                                    v-if="editor.link"
                                    class="type-label-lg link"
                                    target="_blank"
                                    :href="editor.link"
                                >
                                    {{ editor.name }}
                                </a>

                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>

                    <h3>Submission Requirements</h3>

                    <p>
                        Achieved the record without using hacks but 1000 tps is
                        allowed for the level "please no" (on other levels,
                        FPS bypass is allowed, up to 360fps)
                    </p>

                    <p>
                        Achieved the record on the level that is listed on the
                        site - please check the level ID before you submit a
                        record
                    </p>

                    <p>
                        Have either source audio or clicks/taps in the video.
                        Edited audio only does not count
                    </p>

                    <p>
                        The recording must have a previous attempt and entire
                        death animation shown before the completion, unless the
                        completion is on the first attempt. Everyplay records
                        are exempt from this
                    </p>

                    <p>
                        The recording must also show the player hit the endwall,
                        or the completion will be invalidated.
                    </p>

                    <p>
                        Do not use secret routes or bug routes, unless it 
                        is approved by the owner. If you see a bug feel free to report it to 
                        Fartical.
                    </p>

                    <p>
                        Do not use easy modes, only a record of the unmodified
                        level qualifies
                    </p>

                    <p>
                        Once a level falls into legacy, we don't accept records
                        for them.
                        If you beat the daily level then nothing happens, don't expect
                        a reward

                        P.S.  typing fartical TOTALLY doesn't do
                        something
                    </p>
                </div>
            </div>
        </main>
    `,
data: () => ({
    list: [],
    editors: [],
    loading: true,
    selected: 0,
    featuredIndex: 0,

    currentGalleryImage: "",

    visitCount: 0,

    secretCode: "",
    goldenButton: false,

    search: "",
    animateLevel: true,
    errors: [],
    roleIconMap,
    store
}),
    computed: {

    filteredList() {

    if (!this.search.trim()) {
        return this.list;
    }

    const search = this.search.toLowerCase();

    return this.list.filter(([level]) => {

        if (!level) return false;

        return level.name.toLowerCase().startsWith(search);

    });

},

    level() {

        return this.list[this.selected]?.[0];

    },

    video() {

        if (!this.level.showcase) {
            return embed(this.level.verification);
        }

        return embed(
            this.toggledShowcase
                ? this.level.showcase
                : this.level.verification
        );

    },

},
    async mounted() {
    this.list = await fetchList();
    let visits = Number(localStorage.getItem("visits") || 0);

visits++;

this.visitCount = visits;

localStorage.setItem("visits", visits);

if (visits === 100) {
    setTimeout(() => {
        alert("Good Job!\n\nYou have officialy visited TFD 100 times!");
    }, 1000);
}

   if (this.list) {
    const today = new Date().toISOString().slice(0, 10);

    let seed = 0;
    for (let i = 0; i < today.length; i++) {
        seed += today.charCodeAt(i);
    }

    this.featuredIndex = seed % this.list.length;
}

    this.editors = await fetchEditors();
        const today = new Date();

const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

this.featuredIndex = seed % this.list.length;

this.goldenButton = Math.floor(Math.random() * 1000) === 0;

window.addEventListener("keydown", (e) => {

    if (e.key.length !== 1) return;

    this.secretCode += e.key.toLowerCase();

    if (this.secretCode.length > 9) {
        this.secretCode = this.secretCode.slice(-9);
    }

    if (this.secretCode === "fartical") {

        document.body.classList.add("fartical-mode");

        alert("🎉 Fartical Mode Activated!");

        setTimeout(() => {
            document.body.classList.remove("fartical-mode");
        }, 15000);

        this.secretCode = "";

    }

});
        
this.loading = false;
    },
 methods: {
    embed,
    score,
},

watch: {

    selected() {
        this.currentGalleryImage = "";
    },

    search() {
        this.selected = 0;
    },

    filteredList() {
        if (this.selected >= this.filteredList.length) {
            this.selected = 0;
        }
    }

},

};
