const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const dataPath = path.join(__dirname, "forum.json");

const initialData = {
  users: [],
  invite_keys: [],
  categories: [],
  threads: [],
  posts: [],
  meta: {}
};

function readData() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  data.meta = data.meta || {};
  return data;
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function nextId(items) {
  return items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function daysAgoRandom(maxDays) {
  const d = new Date();
  const offset = Math.floor(Math.random() * maxDays * 24 * 60 * 60 * 1000);
  d.setTime(d.getTime() - offset);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function makeUsernames(count) {
  const bases = [
    "newlesser","wish","intergod","skeeter","void","nix","byte","fatal","oxide","shiro","north","aimless",
    "monolith","proxy","orbit","phase","crimson","venom","raven","lucid","drift","sector","syntax","silent",
    "zero","delta","vector","carbon","pixel","night","index","memory","static","hydra","pluto","kairo",
    "vortex","neon","motive","recoil","capsule","kernel","ghost","route","dream","lunar","mirage","script"
  ];
  const suffixes = ["", "x", "dev", "1337", "cs", "uid", "cfg", "lol", "exe", "pub", "v2", "main"];
  const set = new Set(["admin"]);
  while (set.size < count + 1) {
    const name = pick(bases) + pick(suffixes) + Math.floor(Math.random() * 9999);
    set.add(name.toLowerCase());
  }
  return [...set].filter((x) => x !== "admin").slice(0, count);
}

function topicPack() {
  return [
    {
      category: "Announcements",
      titles: [
        "small forum update", "maintenance window", "rules reminder", "invite wave notes",
        "server side changes", "quick status update", "premium access notice", "account cleanup"
      ],
      replies: [
        "thanks for the update.", "noticed it, works fine now.", "no issues on my side.",
        "good change tbh.", "finally fixed for me.", "all good here.", "clean update."
      ]
    },
    {
      category: "General",
      titles: [
        "cs2 feels weird today", "anyone else getting random lag", "best cfg settings rn",
        "rate the new build", "quick question about trust factor", "share your setup",
        "what mouse are you using", "weekend queue thread", "random screenshots thread",
        "best crosshair color", "any good servers tonight", "faceit stories"
      ],
      replies: [
        "same here, felt different after the update.", "try clearing shader cache.",
        "works fine for me.", "probably server related.", "depends on your settings.",
        "i had this yesterday too.", "restart fixed it for me.", "post your cfg.",
        "low latency mode helped a bit.", "not sure, could be placebo."
      ]
    },
    {
      category: "Media",
      titles: [
        "post your clips", "funny lobby screenshots", "clean ace from yesterday",
        "old screenshots dump", "rate this inventory", "weird demo bug",
        "best moments this week", "new banner ideas", "desktop screenshots"
      ],
      replies: [
        "clean clip.", "that second kill was nasty.", "lmao nice one.",
        "quality is cooked but funny.", "upload the demo too.", "solid.",
        "that inventory goes hard.", "send more."
      ]
    },
    {
      category: "Configs",
      titles: [
        "clean low sens config", "video settings thread", "autoexec collection",
        "launch options that still work", "sound settings discussion", "binds thread",
        "fps optimization notes", "radar settings", "viewmodel thread"
      ],
      replies: [
        "using almost the same config.", "this helped my fps a little.",
        "remove that launch option.", "viewmodel looks clean.",
        "saved this, thanks.", "worked after restart.", "good settings."
      ]
    },
    {
      category: "Support",
      titles: [
        "cant login after password change", "email confirmation issue", "invite code question",
        "profile page bug", "pm not loading", "forum time zone wrong", "avatar upload issue",
        "session keeps expiring"
      ],
      replies: [
        "try logging out and back in.", "fixed after clearing cookies.",
        "admin needs to check this.", "same issue here.", "works now.",
        "probably cached.", "send browser console error."
      ]
    }
  ];
}

function initDb() {
  const data = readData();

  if (data.invite_keys.length === 0) {
    data.invite_keys.push({
      id: 1,
      key: "GS-1337-WISH-7ED3",
      used_by: null,
      created_at: now(),
      used_at: null
    });
  }

  if (data.users.length === 0) {
    data.users.push({
      id: 1,
      username: "admin",
      password_hash: bcrypt.hashSync("password", 10),
      role: "admin",
      created_at: now()
    });
  }

  if (data.categories.length === 0) {
    data.categories.push(
      { id: 1, title: "Announcements", description: "Important forum updates and notices.", sort_order: 1 },
      { id: 2, title: "General", description: "General discussion and rofl threads.", sort_order: 2 },
      { id: 3, title: "Media", description: "Screenshots, clips and random files.", sort_order: 3 },
      { id: 4, title: "Configs", description: "Settings, binds, launch options and setup threads.", sort_order: 4 },
      { id: 5, title: "Support", description: "Account, access and forum support.", sort_order: 5 }
    );
  }

  if (!data.meta.fakeSeeded) {
    seedFakeActivity(data);
    data.meta.fakeSeeded = true;
    data.meta.displayUsers = 4387 + Math.floor(Math.random() * 900);
    data.meta.displayTopics = 512 + Math.floor(Math.random() * 120);
    data.meta.displayPosts = 4210 + Math.floor(Math.random() * 1300);
    data.meta.displayOnline = 19 + Math.floor(Math.random() * 54);
    data.meta.newestMember = data.users[data.users.length - 1]?.username || "newlesser";
  }

  writeData(data);
}

function seedFakeActivity(data) {
  const password = bcrypt.hashSync("password", 10);
  const names = makeUsernames(140);

  for (const username of names) {
    data.users.push({
      id: nextId(data.users),
      username,
      password_hash: password,
      role: Math.random() > 0.72 ? "premium" : "member",
      created_at: daysAgoRandom(80)
    });
  }

  const packs = topicPack();
  const categoryByTitle = Object.fromEntries(data.categories.map((c) => [c.title, c.id]));

  for (let i = 0; i < 540; i++) {
    const pack = pick(packs);
    const user = pick(data.users);
    const titleBase = pick(pack.titles);
    const title = Math.random() > 0.65 ? `${titleBase} #${Math.floor(Math.random() * 90) + 1}` : titleBase;
    const threadDate = daysAgoRandom(20);

    const thread = {
      id: nextId(data.threads),
      category_id: categoryByTitle[pack.category] || 2,
      user_id: user.id,
      title,
      body: makeOpeningPost(titleBase, pack.category),
      created_at: threadDate
    };

    data.threads.push(thread);

    const replyCount = Math.floor(Math.random() * 8); // 0-7
    for (let r = 0; r < replyCount; r++) {
      const replyUser = pick(data.users);
      data.posts.push({
        id: nextId(data.posts),
        thread_id: thread.id,
        user_id: replyUser.id,
        body: pick(pack.replies),
        created_at: daysAgoRandom(20)
      });
    }
  }

  data.threads.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

function makeOpeningPost(title, category) {
  const byCategory = {
    "Announcements": [
      "Small update pushed. Report anything broken in this thread.",
      "Keeping this short. Some backend cleanup was done today.",
      "Access and invite checks were adjusted. Nothing major."
    ],
    "General": [
      "Wanted to ask here before messing with settings again.",
      "Anyone else noticed this recently or is it just me?",
      "Drop your thoughts, curious what everyone is running."
    ],
    "Media": [
      "Post related stuff here, trying to keep it in one thread.",
      "Small dump from the last few days.",
      "Upload clips/screens below."
    ],
    "Configs": [
      "Sharing this because a few people asked in PM.",
      "Testing different settings, post what works for you.",
      "Trying to keep a clean config thread."
    ],
    "Support": [
      "Need help with this, not sure if it is client side.",
      "Posting here so others can find the fix too.",
      "Had this issue after the last change."
    ]
  };
  return pick(byCategory[category] || byCategory.General);
}

const db = {
  getUserByUsername(username) {
    return readData().users.find((user) => user.username === username);
  },

  getUserById(id) {
    return readData().users.find((user) => user.id === Number(id));
  },

  createUser(username, passwordHash, role = "member") {
    const data = readData();
    const user = {
      id: nextId(data.users),
      username,
      password_hash: passwordHash,
      role,
      created_at: now()
    };
    data.users.push(user);
    data.meta.newestMember = username;
    writeData(data);
    return user;
  },

  getInvite(key) {
    return readData().invite_keys.find((invite) => invite.key === key && invite.used_by === null);
  },

  useInvite(inviteId, userId) {
    const data = readData();
    const invite = data.invite_keys.find((item) => item.id === Number(inviteId));
    if (invite) {
      invite.used_by = userId;
      invite.used_at = now();
    }
    writeData(data);
  },

  getCategoriesWithStats() {
    const data = readData();
    return data.categories
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((category) => {
        const threads = data.threads.filter((thread) => thread.category_id === category.id);
        const posts = data.posts.filter((post) => threads.some((thread) => thread.id === post.thread_id));
        const lastThread = threads.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
        const lastPost = posts.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
        const last = [lastThread, lastPost].filter(Boolean).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];

        return {
          ...category,
          thread_count: threads.length,
          post_count: posts.length,
          last_post: last ? last.created_at : ""
        };
      });
  },

  getForumStats() {
    const data = readData();
    return {
      users: Math.max(data.users.length, data.meta.displayUsers || 4387),
      topics: Math.max(data.threads.length, data.meta.displayTopics || 512),
      posts: Math.max(data.posts.length + data.threads.length, data.meta.displayPosts || 4210),
      online: data.meta.displayOnline || 37,
      newestMember: data.meta.newestMember || "newlesser"
    };
  },

  getCategory(id) {
    return readData().categories.find((category) => category.id === Number(id));
  },

  getThreadsByCategory(categoryId) {
    const data = readData();
    return data.threads
      .filter((thread) => thread.category_id === Number(categoryId))
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .map((thread) => ({
        ...thread,
        reply_count: data.posts.filter((post) => post.thread_id === thread.id).length,
        username: (data.users.find((user) => user.id === thread.user_id) || {}).username || "unknown"
      }));
  },

  createThread(categoryId, userId, title, body) {
    const data = readData();
    const thread = {
      id: nextId(data.threads),
      category_id: Number(categoryId),
      user_id: Number(userId),
      title,
      body,
      created_at: now()
    };
    data.threads.push(thread);
    writeData(data);
    return thread;
  },

  getUserStats(userId) {
    const data = readData();
    return {
      threads: data.threads.filter((thread) => thread.user_id === Number(userId)).length,
      posts: data.posts.filter((post) => post.user_id === Number(userId)).length
    };
  },

  getThread(id) {
    const data = readData();
    const thread = data.threads.find((item) => item.id === Number(id));
    if (!thread) return null;
    return {
      ...thread,
      username: (data.users.find((user) => user.id === thread.user_id) || {}).username || "unknown"
    };
  },

  getPostsByThread(threadId) {
    const data = readData();
    return data.posts
      .filter((post) => post.thread_id === Number(threadId))
      .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
      .map((post) => {
        const user = data.users.find((item) => item.id === post.user_id);
        return {
          ...post,
          username: user ? user.username : "unknown",
          role: user ? user.role : "member"
        };
      });
  },

  createPost(threadId, userId, body) {
    const data = readData();
    data.posts.push({
      id: nextId(data.posts),
      thread_id: Number(threadId),
      user_id: Number(userId),
      body,
      created_at: now()
    });
    writeData(data);
  }
};

module.exports = { db, initDb };
