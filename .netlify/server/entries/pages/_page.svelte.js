import { d as now, l as loop, c as create_ssr_component, a as subscribe, g as getContext, f as add_attribute, e as escape, h as each, s as setContext, v as validate_component } from "../../chunks/index.js";
import { w as writable, d as derived } from "../../chunks/index2.js";
import * as Tone from "tone";
const notes = {
  simple: ["C", "D", "E", "F", "G", "A", "B"],
  advanced: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
};
const br_maps = {
  simple: [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 1, 1, 1]
  ],
  advanced: [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [2, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 2],
    [1, 0, 1, 0],
    [0, 0, 2, 0],
    [0, 1, 0, 1],
    [0, 0, 0, 2],
    [1, 1, 1, 1]
  ]
};
const getNote = (value = 0, mode2 = "simple") => {
  return notes[mode2][value - 1];
};
function is_date(obj) {
  return Object.prototype.toString.call(obj) === "[object Date]";
}
function tick_spring(ctx, last_value, current_value, target_value) {
  if (typeof current_value === "number" || is_date(current_value)) {
    const delta = target_value - current_value;
    const velocity = (current_value - last_value) / (ctx.dt || 1 / 60);
    const spring2 = ctx.opts.stiffness * delta;
    const damper = ctx.opts.damping * velocity;
    const acceleration = (spring2 - damper) * ctx.inv_mass;
    const d = (velocity + acceleration) * ctx.dt;
    if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
      return target_value;
    } else {
      ctx.settled = false;
      return is_date(current_value) ? new Date(current_value.getTime() + d) : current_value + d;
    }
  } else if (Array.isArray(current_value)) {
    return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
  } else if (typeof current_value === "object") {
    const next_value = {};
    for (const k in current_value) {
      next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
    }
    return next_value;
  } else {
    throw new Error(`Cannot spring ${typeof current_value} values`);
  }
}
function spring(value, opts = {}) {
  const store = writable(value);
  const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
  let last_time;
  let task;
  let current_token;
  let last_value = value;
  let target_value = value;
  let inv_mass = 1;
  let inv_mass_recovery_rate = 0;
  let cancel_task = false;
  function set(new_value, opts2 = {}) {
    target_value = new_value;
    const token = current_token = {};
    if (value == null || opts2.hard || spring2.stiffness >= 1 && spring2.damping >= 1) {
      cancel_task = true;
      last_time = now();
      last_value = new_value;
      store.set(value = target_value);
      return Promise.resolve();
    } else if (opts2.soft) {
      const rate = opts2.soft === true ? 0.5 : +opts2.soft;
      inv_mass_recovery_rate = 1 / (rate * 60);
      inv_mass = 0;
    }
    if (!task) {
      last_time = now();
      cancel_task = false;
      task = loop((now2) => {
        if (cancel_task) {
          cancel_task = false;
          task = null;
          return false;
        }
        inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
        const ctx = {
          inv_mass,
          opts: spring2,
          settled: true,
          dt: (now2 - last_time) * 60 / 1e3
        };
        const next_value = tick_spring(ctx, last_value, value, target_value);
        last_time = now2;
        last_value = value;
        store.set(value = next_value);
        if (ctx.settled) {
          task = null;
        }
        return !ctx.settled;
      });
    }
    return new Promise((fulfil) => {
      task.promise.then(() => {
        if (token === current_token)
          fulfil();
      });
    });
  }
  const spring2 = {
    set,
    update: (fn, opts2) => set(fn(target_value, value), opts2),
    subscribe: store.subscribe,
    stiffness,
    damping,
    precision
  };
  return spring2;
}
const colors = ["tomato", "hotpink", "pink", "aqua", "lightgreen", "mediumpurple"];
const Cell_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: ".cell.svelte-18uqust{text-indent:-9999px;border:none;width:100%;height:100%;background-color:var(--color, white);box-shadow:0 16px 24px -8px rgba(0, 0, 0, 0.1);font-size:3rem;font-weight:bold;font-family:sans-serif;border-radius:4px}.cell[data-value='0'].svelte-18uqust{background-color:white}",
  map: null
};
const Cell = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let br;
  let color;
  let $data, $$unsubscribe_data;
  let $scale, $$unsubscribe_scale;
  let { colorId = 0 } = $$props;
  let { currentlyPlaying = false } = $$props;
  let { data } = $$props;
  $$unsubscribe_data = subscribe(data, (value) => $data = value);
  let state = "idle";
  const scale = spring(1);
  $$unsubscribe_scale = subscribe(scale, (value) => $scale = value);
  const pressed = (nextState) => {
    if (state === nextState) {
      return;
    }
    if (nextState === "playing") {
      scale.set(0.9);
      state = "playing";
      setTimeout(
        () => {
          pressed("idle");
        },
        300
      );
    }
    if (nextState === "idle") {
      scale.set(1);
      state = "idle";
    }
  };
  const { instruments, mode: mode2 } = getContext("app");
  const br_map = br_maps[mode2];
  if ($$props.colorId === void 0 && $$bindings.colorId && colorId !== void 0)
    $$bindings.colorId(colorId);
  if ($$props.currentlyPlaying === void 0 && $$bindings.currentlyPlaying && currentlyPlaying !== void 0)
    $$bindings.currentlyPlaying(currentlyPlaying);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css$2);
  {
    if (currentlyPlaying) {
      pressed("playing");
    }
  }
  br = br_map[$data.value].map((v) => v * 50 + "%").join(" ");
  color = colors[$data.colorId];
  $$unsubscribe_data();
  $$unsubscribe_scale();
  return `<button${add_attribute("data-value", $data.value, 0)} class="${"cell svelte-18uqust"}" style="${"--color: " + escape(color, true) + "; border-radius: " + escape(br, true) + "; transform: scale(" + escape($scale, true) + ");"}">${escape($data.value)}</button>`;
});
const Palette_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".list.svelte-bkrlmt{list-style-type:none;margin:0;padding:0;display:flex;flex-flow:column;gap:0.75rem}.color-btn.svelte-bkrlmt{text-indent:-9999px;width:2rem;height:2rem;border:none;border-radius:1rem;background-color:var(--color);transition:transform 0.3s ease}.color-btn[data-selected='true'].svelte-bkrlmt{transform:translateX(1rem)}",
  map: null
};
const Palette = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $colorId, $$unsubscribe_colorId;
  let { colorId } = $$props;
  $$unsubscribe_colorId = subscribe(colorId, (value) => $colorId = value);
  if ($$props.colorId === void 0 && $$bindings.colorId && colorId !== void 0)
    $$bindings.colorId(colorId);
  $$result.css.add(css$1);
  $$unsubscribe_colorId();
  return `<nav><ul class="${"list svelte-bkrlmt"}">${each(colors, (color, i) => {
    return `<li><button class="${"color-btn svelte-bkrlmt"}"${add_attribute("data-selected", i === $colorId, 0)} style="${"--color: " + escape(color, true)}">${escape(color)}</button>
			</li>`;
  })}</ul>
</nav>`;
});
const wrapInstrument = (instrument) => {
  return {
    play: (...args) => {
      instrument.triggerAttackRelease(...args);
    }
  };
};
const getInstruments = () => {
  const wah = new Tone.AutoWah(50, 6, -30).toDestination();
  wah.Q.value = 6;
  const wahSynth = new Tone.Synth().connect(wah);
  return [
    new Tone.Synth().toDestination(),
    wahSynth,
    new Tone.AMSynth().toDestination(),
    new Tone.MembraneSynth().toDestination(),
    new Tone.FMSynth().toDestination(),
    new Tone.DuoSynth().toDestination()
  ].map((instrument) => wrapInstrument(instrument));
};
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "main.svelte-2mshba{width:100vw;height:100vh;background-color:snow;display:flex;align-items:center;justify-content:center}.container.svelte-2mshba{width:50vw;height:40vw;margin:0 auto;max-width:64rem;min-width:20rem;display:grid;grid:auto-flow / repeat(5, 1fr);grid-gap:0.5rem}.cell-wrapper.svelte-2mshba{aspect-ratio:1 / 1}.palette-wrapper.svelte-2mshba{position:absolute;left:2rem}.play-wrapper.svelte-2mshba{position:absolute;right:2rem}.play.svelte-2mshba{position:relative;width:4rem;height:4rem;color:white;background-color:tomato;font-size:2rem;border:none;border-radius:100%}.play[disabled].svelte-2mshba{background-color:gray}.fullscreen-wrapper.svelte-2mshba{position:absolute;right:2rem;bottom:2rem}.fullscreen.svelte-2mshba{width:3rem;height:3rem;border:none;background-color:transparent;border-radius:4px;border:2px solid mediumpurple;color:mediumpurple;font-family:sans-serif;font-weight:bold}.fullscreen[data-fullscreen='true'].svelte-2mshba{background-color:mediumpurple;border-radius:4px;border-color:transparent;color:white}",
  map: null
};
let size = 20;
let mode = "advanced";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_noteSeries;
  let $colorId, $$unsubscribe_colorId;
  const instruments = getInstruments();
  let ref;
  let isFullscreen = false;
  let currentlyPlaying = -1;
  const colorId = writable(0);
  $$unsubscribe_colorId = subscribe(colorId, (value) => $colorId = value);
  const data = Array.from({ length: size }, () => writable({ value: 0, colorId: 0 }));
  setContext("app", { instruments, mode });
  const noteSeries = derived([...data], (items) => {
    return items.map((item) => {
      const note = getNote(item.value, mode);
      const effectId = item.colorId;
      return { effectId, note: note ? `${note}4` : "C1" };
    });
  });
  $$unsubscribe_noteSeries = subscribe(noteSeries, (value) => value);
  $$result.css.add(css);
  $$unsubscribe_noteSeries();
  $$unsubscribe_colorId();
  return `${$$result.head += `<!-- HEAD_svelte-1anpopb_START -->${$$result.title = `<title>Home</title>`, ""}<!-- HEAD_svelte-1anpopb_END -->`, ""}

<main class="${"svelte-2mshba"}"${add_attribute("this", ref, 0)}><div class="${"palette-wrapper svelte-2mshba"}">${validate_component(Palette, "Palette").$$render($$result, { colorId }, {}, {})}</div>
	<div class="${"play-wrapper svelte-2mshba"}"><button class="${"play svelte-2mshba"}" ${""}>⟳</button>
		<button>Clear</button></div>
	<div class="${"fullscreen-wrapper svelte-2mshba"}"><button class="${"fullscreen svelte-2mshba"}"${add_attribute("data-fullscreen", isFullscreen, 0)}>FS</button></div>
	<div class="${"container svelte-2mshba"}">${each(data, (item, i) => {
    return `<div class="${"cell-wrapper svelte-2mshba"}">${validate_component(Cell, "Cell").$$render(
      $$result,
      {
        colorId: $colorId,
        data: item,
        currentlyPlaying: currentlyPlaying === i
      },
      {},
      {}
    )}
			</div>`;
  })}</div>
</main>`;
});
export {
  Page as default
};
