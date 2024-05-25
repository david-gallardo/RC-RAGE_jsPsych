/**
 * rc-rage_main.js
 * Kyoung Whan Choe (https://github.com/kywch/)
 *
 * jspsych plugin for threading the RC-RAGE trials
 * 
 **/

/*
 * Generic task variables
 */
var sbj_id = ""; // mturk id
var task_id = ""; // the prefix for the save file -- the main seq
var data_dir = "";

/* 
 * RC-RAGE specific variables
 */
var flag_debug = false;
var flag_save = false;
var take_back_amount = 3; // default value
var main_score = 0;
var prac_score = 20;
var prac_time = 2 * 60 * 1000; // ms
var circle_loc = null;
if (flag_debug) {
    // shooting for 3 trials (6 harvests) within 3 minutes
    var time_limit = 3 * 60 * 1000; // ms
    var main_seq = [Infinity].concat(jsPsych.randomization.shuffle([1, 2, 3, 4, 6, 7, Infinity, Infinity]));
    var break_after_trial = [2];
    var break_after_trial = [3, 7];

} else {
    var time_limit = 12 * 60 * 1000; // ms
    var main_seq = [Infinity].concat(jsPsych.randomization.shuffle([1, 2, 3, 4, 6, 7, Infinity, Infinity]));
    main_seq = main_seq.concat(jsPsych.randomization.shuffle([1, 2, 3, 4, 6, 7, Infinity, Infinity, Infinity]));
    main_seq = main_seq.concat(jsPsych.randomization.shuffle([1, 2, 3, 4, 6, 7, Infinity, Infinity, Infinity]));
    var break_after_trial = [3, 7, 11, 15, 19, 23];
}
var score_history = [];
var click_history = [];
var wasted_click_history = [];

// a single result string will be generated for saving to qualtrics
var result_string = 'trial steal_timing finish_code click_cnt extra_click points rt time_remain;';

// activity tracking
var focus = 'focus'; // tracks if the current tab/window is the active tab/window, initially the current tab should be focused
var fullscr_ON = 'no'; // tracks fullscreen activity, initially not activated
var record_mouse = false;

/*
 * Helper functions
 */

// YOU MUST GET YOUR OWN DROPBOX ACCESS TOKEN for uploading the file to your dropbox
// from https://dropbox.github.io/dropbox-api-v2-explorer/#files_upload
var dropbox_access_token = '';
var save_filename = '/' + task_id + '_' + sbj_id + '.json';

function save_data() {
    // if you prefer json-format, use jsPsych.data.get().json()
    // if you prefer csv-format, use jsPsych.data.get().csv()
    if (flag_debug) {
        console.log("Cridada la funció per guardar les dades.");
        //console.log(jsPsych.data.get().json());
    }
    try {
        var dbx = new Dropbox.Dropbox({
            fetch: fetch,
            accessToken: dropbox_access_token
        });
        dbx.filesUpload({
                path: save_filename,
                mode: 'overwrite',
                mute: true,
                contents: jsPsych.data.get().json()
            })
            .then(function (response) {
                if (flag_debug) {
                    console.log(response);
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    } catch (err) {
        console.log("La funció per desar les dades ha fallat.", err);
    }
}

var audio_url = 'https://github.com/david-gallardo/RC-RAGE_jsPsych/sounds/';
var audio_seed = ['c', 'd', 'g', 'k', 'p', 'q', 't'];

function get_audio_url(audio_char) { // CHECK THE URL before use
    return audio_url + audio_char + '.mp3';
}

/*
 * Instruction page -> import image instructions and display
 */

function get_instruction_imglist(instr_url, num_slides = 30) {
    var imglist = [];
    for (var ii = 0; ii < num_slides; ii++) {
        imglist.push(instr_url + 'Slide' + (ii + 1).toString() + '.JPG');
    }
    return imglist;
}

function generate_instruction_block(imglist, takeBackAmount = take_back_amount) {

    var block_instruction = [];

    var RAGE_instruction_page_1 = {
        type: 'instructions',
        pages: [
            '<img class="resize" src="' + imglist[0] + '">', // Slide1
            '<img class="resize" src="' + imglist[1] + '">', // Slide2
            '<img class="resize" src="' + imglist[2] + '">', // Slide3
            '<img class="resize" src="' + imglist[3] + '">', // Slide4
            '<img class="resize" src="' + imglist[4] + '">', // Slide5
            '<img class="resize" src="' + imglist[5] + '">', // Slide6
            '<img class="resize" src="' + imglist[6] + '">', // Slide7
            '<img class="resize" src="' + imglist[7] + '">', // Slide8
            '<img class="resize" src="' + imglist[8] + '">', // Slide9
            '<img class="resize" src="' + imglist[9] + '">' // Slide10
        ],
        data: {
            exp_stage: 'RC-RAGE_instruction_page_1',
            task_id: function () {
                return task_id;
            },
            sbj_id: function () {
                return sbj_id;
            }
        },
        allow_keys: false,
        show_clickable_nav: true,
        show_page_number: true
    };
    block_instruction.push(RAGE_instruction_page_1);

    // single money-making practice trial
    var RAGE_instruction_harvest_practice = {
        type: 'rc-rage',
        prompt: '<div width="800px"><p class = block-text><i>Fes clic a la poma per i guanyar 20 punts per a continuar.</i></p></div>',
        data: {
            exp_stage: 'RC-RAGE_instruction_harvest_practice',
            task_id: function () {
                return task_id;
            },
            sbj_id: function () {
                return sbj_id;
            }
        }
    };
    block_instruction.push(RAGE_instruction_harvest_practice);

    var RAGE_instruction_page_2 = {
        type: 'instructions',
        pages: [
            '<img class="resize" src="' + imglist[11] + '">', // Slide12
            '<img class="resize" src="' + imglist[12] + '">', // Slide13
            '<img class="resize" src="' + imglist[13] + '">', // Slide14
            '<img class="resize" src="' + imglist[14] + '">' // Slide15
        ],
        data: {
            exp_stage: 'RC-RAGE_instruction_page_2'
        },
        allow_keys: false,
        show_clickable_nav: true,
        show_page_number: true
    };
    block_instruction.push(RAGE_instruction_page_2);

    // after this stealing happens
    var RAGE_instruction_steal = {
        type: 'audio-keyboard-with-replay',
        stimulus: audio_url + '170623_jorickhoofd_funny-high-giggle.mp3',
        prompt: '<img class="resize" src="' + imglist[15] + '">', // Slide16
        choices: ['y'],
        replay_key: 'n',
        data: {
            exp_stage: 'RC-RAGE_instruction_steal'
        }
    }
    block_instruction.push(RAGE_instruction_steal);

    var RAGE_instruction_page_3 = {
        type: 'instructions',
        pages: [
            '<img class="resize" src="' + imglist[16] + '">', // Slide17
            '<img class="resize" src="' + imglist[17] + '">', // Slide18
            '<img class="resize" src="' + imglist[18] + '">' // Slide19
        ],
        data: {
            exp_stage: 'RC-RAGE_instruction_page_3'
        },
        allow_keys: false,
        show_clickable_nav: true,
        show_page_number: true
    };
    block_instruction.push(RAGE_instruction_page_3);

    // after this stealing happens
    var RAGE_instruction_escape = {
        type: 'audio-keyboard-with-replay',
        stimulus: audio_url + 'Yahoo-SoundBible.com-1888534056.mp3',
        prompt: '<img class="resize" src="' + imglist[19] + '">', // Slide20
        choices: ['y'],
        replay_key: 'n',
        data: {
            exp_stage: 'RC-RAGE_instruction_escape'
        }
    }
    block_instruction.push(RAGE_instruction_escape);

    var RAGE_instruction_page_4 = {
        type: 'instructions',
        pages: [
            '<img class="resize" src="' + imglist[20] + '">', // Slide21
            '<img class="resize" src="' + imglist[21] + '">', // Slide22
            '<img class="resize" src="' + imglist[22] + '">' // Slide23
        ],
        data: {
            exp_stage: 'RC-RAGE_instruction_page_4'
        },
        allow_keys: false,
        show_clickable_nav: true,
        show_page_number: true
    };
    block_instruction.push(RAGE_instruction_page_4);

    // single shooting practice trial
    var RAGE_instruction_shooting_practice = {
        type: 'rc-rage',
        start_points: 15,
        prompt: '<p class = block-text><i>Destrueix el lladre-emoticona per a continuar.</i></p>',
        shoot_prac: true,
        takeback_amount: takeBackAmount,
        data: {
            exp_stage: 'RC-RAGE_instruction_shooting_practice'
        }
    };
    block_instruction.push(RAGE_instruction_shooting_practice);

    var RAGE_instruction_page_5 = {
        type: 'instructions',
        pages: [
            '<img class="resize" src="' + imglist[24] + '">', // Slide25
            '<img class="resize" src="' + imglist[25] + '">', // Slide26
            '<img class="resize" src="' + imglist[26] + '">', // Slide27
            '<img class="resize" src="' + imglist[27] + '">', // Slide28
            '<img class="resize" src="' + imglist[28] + '">', // Slide29
            '<img class="resize" src="' + imglist[29] + '">' // Slide30
        ],
        data: {
            exp_stage: 'RC-RAGE_instruction_page_5'
        },
        allow_keys: false,
        show_clickable_nav: true,
        show_page_number: true,
        on_finish: function () {
            if (flag_save) {
                save_data();
            }
            circle_loc = null;
        }
    };
    block_instruction.push(RAGE_instruction_page_5);

    return block_instruction;
}


/*
 * 2 minutes of task practice
 */
function generate_practice_block(takeBackAmount = take_back_amount, smileyGoneBeforeHarvest = true, audioTest = true) {
    // time limit: 2 minutes
    var prac_seq = [5, 5, 5, 5, 5, 5]; // [3, 7, 3, 7, 3, 7];
    var audio_testseq = jsPsych.randomization.shuffle([...audio_seed]);

    if (flag_debug) {
        console.log("Take back amount: ", takeBackAmount);
        console.log("Smiley gone before harvest: ", smileyGoneBeforeHarvest);
        console.log("Audio test: ", audioTest);
    }

    var block_sequence = [];

    for (var ii = 0; ii < prac_seq.length; ii++) {

        var continuous_rage = {
            type: 'rc-rage',
            start_points: function () {
                return prac_score;
            },
            time_remain: function () {
                return prac_time;
            },
            prev_circle_loc: function () {
                return circle_loc;
            },
            prompt: '<div style="width:800px"><p class = block-text><i>Tracta de guanyar tants punts com sigui possible durant els 2 següents minuts per a practicar.</p></div>',
            //prompt: '<div style="width:800px"><p class = block-text><i>Prova de fer el què vulguis durant els 2 propers minuts de pràctica. ' +
            //    'The practice points will <b>NOT</b> be exchanged for money.</i></p></div>',
            steal_timing: prac_seq[ii],
            escape_before_harvest: smileyGoneBeforeHarvest,
            takeback_amount: takeBackAmount,
            record_mouse: function () {
                return record_mouse;
            },
            data: {
                exp_stage: 'practice_trial_RC-RAGE_' + (ii + 1).toString()
            },
            on_finish: function (data) {
                // update the score and circle_loc
                prac_score = prac_score + data.points_trial;
                prac_time = data.time_remain;
                circle_loc = data.last_circle_loc;
            }
        };
        block_sequence.push(continuous_rage);

        // audio-test break
        var audiotest_trial = {
            type: 'audio-keyboard-with-replay',
            time_remain: function () {
                return prac_time;
            },
            stimulus: get_audio_url(audio_testseq[ii]),
            prompt: "<div class = centerbox><p class = block-text>" +
                "<p class = block-text><font color=red><strong>Control atencional!</strong> EL COMPTADOR ENCARA CORRE.</font></p>" +
                "<p class = block-text>Si us plau, prem la tecla de l'alfabet que acabes de sentir.</p> " +
                "<p class = block-text>Per a reproduir de nou, prem la tecla <strong>'r'</strong>. </p></div>",
            choices: [audio_testseq[ii]],
            data: {
                exp_stage: 'audiotest_trial_' + ii.toString(),
                played_audio: audio_testseq[ii]
            },
            on_finish: function (data) {
                if (flag_debug) {
                    console.log("Audio-test RT: ", data.rt, prac_time);
                }
                // update the time
                prac_time = prac_time - data.rt;
            }
        };
        if (audioTest) {
            if ([0, 2].includes(ii)) {
                block_sequence.push(audiotest_trial);
            }
        }
    }
    return block_sequence;
}


/*
 * 12 minutes of task practice
 */
function generate_main_block(takeBackAmount = take_back_amount, smileyGoneBeforeHarvest = true) {

    var audio_testseq = jsPsych.randomization.shuffle([...audio_seed]);

    var block_sequence = [];

    // we may want to provide more information here
    // also mention the middle rest block
    var block_start_page = {
        type: 'instructions',
        pages: [
            '<div class = centerbox><p class = block-text>La tasca principal és a punt de començar.</p>' +
            '<p class = block-text>Tracta de guanyar tants punts com puguis durant els següents 12 minuts.</p></div>',
            '<div class = centerbox><p class = block-text>Agafa aire, i fes click a Següent per tal de començar la tasca principal!</p></div>'
        ],
        allow_keys: false,
        show_clickable_nav: true,
        allow_backward: false,
        show_page_number: false,
        data: {
            exp_stage: 'main_start_page',
            task_id: function () {
                return task_id;
            },
            sbj_id: function () {
                return sbj_id;
            },
            main_seq: main_seq
        },
        on_finish: function () {
            if (flag_save) {
                save_data();
            } // again resetting the circle location
            circle_loc = null;
        }
    };
    block_sequence.push(block_start_page);

    for (var ii = 0; ii < main_seq.length; ii++) {
        var continuous_rage = {
            type: 'rc-rage',
            start_points: function () {
                return main_score;
            },
            time_remain: function () {
                return time_limit;
            },
            prev_circle_loc: function () {
                return circle_loc;
            },
            steal_timing: main_seq[ii],
            escape_before_harvest: smileyGoneBeforeHarvest,
            takeback_amount: takeBackAmount,
            record_mouse: function () {
                return record_mouse;
            },
            data: {
                exp_stage: 'main_trial_RC-RAGE_' + (ii + 1).toString(),
                trial_cnt: (ii + 1).toString(),
                steal_timing: main_seq[ii].toString()
            },
            on_finish: function (data) {
                // update the variables to feed into the next trial
                main_score = main_score + data.points_trial;
                time_limit = data.time_remain;
                circle_loc = data.last_circle_loc;

                // quick result summary
                score_history.push(data.points_trial);
                click_history.push(data.click_history.length);
                wasted_click_history.push(data.wasted_click);

                if (time_limit > 0 || data.finish_code == 99) {
                    // csv-like string: delimiter - space (' '), newline - semicolon (';')
                    //results_string = 'trial steal_timing finish_code click_cnt extra_click points rt time_remain;';
                    result_string += data.trial_cnt + ' ' + // trial
                        data.steal_timing + ' ' + // steal_timing
                        data.finish_code.toString() + ' ' + // finish_code
                        data.click_history.length.toString() + ' ' + // click_cnt
                        data.wasted_click.toString() + ' ' + // extra_click
                        data.points_trial.toString() + ' ' + // points
                        Math.round(data.rt).toString() + ' ' + // rt
                        Math.round(time_limit).toString() + ';'; // time_remain
                } else {
                    result_string += data.trial_cnt + ' ' + // trial
                        data.steal_timing + ' ' + // steal_timing
                        data.finish_code.toString() + ' ' + // finish_code
                        'NaN ' + // click_cnt
                        'NaN ' + // extra_click
                        'NaN ' + // points
                        'NaN ' + // rt
                        'NaN;'; // time_remain
                }
            }
        };
        block_sequence.push(continuous_rage);

        // break page
        if (break_after_trial.includes(ii)) {

            var audiotest_trial = {
                type: 'audio-keyboard-with-replay',
                time_remain: function () {
                    return time_limit;
                },
                stimulus: get_audio_url(audio_testseq[Math.floor(ii / 4)]),
                prompt: "<div class = centerbox><p class = block-text>" +
                    "<p class = block-text><font color=red><strong>Control atencional!</strong> EL COMPTADOR ENCARA CORRE.</font></p>" +
                    "<p class = block-text>Si us plau, prem la tecla de l'alfabet que acabes de sentir.</p> " +
                    "<p class = block-text>Per a reproduir de nou, prem la tecla <strong>'r'</strong>. </p></div>",
                choices: [audio_testseq[Math.floor(ii / 4)]],
                data: {
                    exp_stage: 'audiotest_trial_' + ii.toString(),
                    played_audio: audio_testseq[Math.floor(ii / 4)]
                },
                on_finish: function (data) {
                    if (flag_save) {
                        save_data();
                    }
                    if (flag_debug) {
                        console.log("Audio-test RT: ", data.rt, time_limit);
                    }
                    // update the time
                    time_limit = time_limit - data.rt;

                    if (time_limit > 0) {
                        // csv-like string: delimiter - space (' '), newline - semicolon (';')
                        //results_string = 'trial steal_timing finish_code click_cnt extra_click points rt time_remain;';
                        result_string += 'attn ' + // trial
                            'NaN ' + // steal_timing
                            'NaN ' + // finish_code
                            'NaN ' + // click_cnt
                            'NaN ' + // extra_click
                            'NaN ' + // points
                            Math.round(data.rt).toString() + ' ' + // rt
                            Math.round(time_limit).toString() + ';'; // time_remain
                    } else {
                        result_string += 'attn ' + // trial
                            'NaN ' + // steal_timing
                            'NaN ' + // finish_code
                            'NaN ' + // click_cnt
                            'NaN ' + // extra_click
                            'NaN ' + // points
                            'NaN ' + // rt
                            'NaN;'; // time_remain
                    }
                }
            }
            block_sequence.push(audiotest_trial);
        }
    }

    return block_sequence;
}
