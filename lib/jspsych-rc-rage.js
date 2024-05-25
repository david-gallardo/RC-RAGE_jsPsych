/**
 * jspsych-rc-rage
 * Kyoung Whan Choe (https://github.com/kywch/)
 *
 * jspsych plugin for a Costly Reactive Agression Paradigm:
 *      Retaliate or Carry-on: Reactive AGression Exerperiment (RC-RAGE)
 * 
 **/

jsPsych.plugins['rc-rage'] = (function () {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('rc-rage', 'sound_steal', 'audio');
    jsPsych.pluginAPI.registerPreload('rc-rage', 'sound_gunshot', 'audio');
    jsPsych.pluginAPI.registerPreload('rc-rage', 'sound_dying', 'audio');
    jsPsych.pluginAPI.registerPreload('rc-rage', 'sound_escape', 'audio');
    jsPsych.pluginAPI.registerPreload('rc-rage', 'robber_happy', 'image');
    jsPsych.pluginAPI.registerPreload('rc-rage', 'robber_dead', 'image');

    plugin.info = {
        name: 'rc-rage',
        description: '',
        parameters: {
            // practice mode
            shoot_prac: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Shooting practice',
                default: false,
                description: 'Set this true when practicing for shooting'
            },
            // history-related variables
            start_points: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Starting points',
                default: 0,
                description: 'Points accumulated so far'
            },
            time_remain: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Time remain (ms)',
                default: Infinity,
                description: 'When this becomes 0, the current trial and task are finished'
            },
            prev_circle_loc: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Previous circle location',
                array: true,
                default: null,
                description: 'This determines where to put the initial circle'
            },
            // important experimental manipulations
            // in the order of event timing
            harvest_click: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Harvest clicks',
                default: 10,
                description: 'Clicks necessary to get points'
            },
            harvest_amount: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Harvest amount',
                default: 10,
                description: 'Points harvested after click threshold (cents)'
            },
            steal_timing: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Steal timing',
                default: Infinity,
                description: 'The number of clicks when the red square appears'
            },
            steal_amount: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Steal amount',
                default: 5,
                description: 'Points being stealed by the robber'
            },
            kill_click: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Kill clicks',
                default: 2,
                description: 'Clicks necessary to kill the square and get the point back'
            },
            takeback_amount: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Take back amount',
                default: 3,
                description: 'Points being reclaimed after killing the robber'
            },
            escape_before_harvest: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Escape before Harvest',
                default: true,
                description: 'Set this true when practicing for shooting'
            },
            escape_click: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Escape clicks',
                default: 12, // fixed long condition: always available to kill
                description: 'Clicks necessary to kill the square and get the point back'
            },
            max_award_count: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Max award count',
                default: 2,
                description: 'When the award is awared this many times, finish this trial'
            },
            record_mouse: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Record mouse',
                default: false,
                description: 'Whether to record mouse trajectory'
            },
            // mechanics-related variables
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Prompt',
                default: '',
                description: 'Description of what participants should do here'
            },
            canvas_size: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Canvas size',
                array: true,
                default: [800, 600], // [xx, yy]
                description: 'Array specifying the width and height of canvas presentation in pixels'
            },
            min_jump_dist: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Jump distance',
                default: 200,
                description: 'Distance that stimuli jump after click'
            },
            refractory_period: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Refractory period',
                default: 500,
                description: 'Refractory period after each click in milliseconds'
            },
            // sound-effect related variables
            sound_steal: {
                type: jsPsych.plugins.parameterType.AUDIO,
                pretty_name: 'Sound steal',
                default: 'https://kywch.github.io/RC-RAGE_jsPsych/sounds/170623_jorickhoofd_funny-high-giggle.mp3',
                description: 'Sound for the robber appearing and stealing points'
            },
            sound_gunshot: { 
                type: jsPsych.plugins.parameterType.AUDIO,
                pretty_name: 'Sound gunshot',
                default: 'https://kywch.github.io/RC-RAGE_jsPsych/sounds/gunshot1.mp3', // alternative: https://kywch.github.io/RC-RAGE_jsPsych/sounds/MP5_SMG-plus-pain.mp3
                description: 'Sound for shooting the robber'
            },
            sound_dying: {
                type: jsPsych.plugins.parameterType.AUDIO,
                pretty_name: 'Sound dying',
                default: 'https://kywch.github.io/RC-RAGE_jsPsych/sounds/gunshot1.mp3', // alternative: https://kywch.github.io/RC-RAGE_jsPsych/sounds/202037_thestigmata_man-die.mp3
                description: 'Sound for the dying robber'
            },
            sound_escape: {
                type: jsPsych.plugins.parameterType.AUDIO,
                pretty_name: 'Sound escape',
                default: 'https://kywch.github.io/RC-RAGE_jsPsych/sounds/Yahoo-SoundBible.com-1888534056.mp3',
                description: 'Sound for the robber escaping'
            },
            // image-effect related variables
            robber_happy: {
                type: jsPsych.plugins.parameterType.IMAGE,
                pretty_name: 'Robber happy',
                default: 'https://kywch.github.io/RC-RAGE_jsPsych/lib/Smily_happy_40px.png',
                description: 'A happy robber image'
            },
            robber_dead: {
                type: jsPsych.plugins.parameterType.IMAGE,
                pretty_name: 'Robber dead',
                default: 'https://kywch.github.io/RC-RAGE_jsPsych/lib/smiley_dead_KLM_40px.png',
                description: 'A dead robber image'
            }
        }
    }

    plugin.trial = function (display_element, trial) {

        // initialize the variables
        var trial_onset = performance.now();
        var points_trial = 0;
        var timerInterval;
        var circle_loc = [0, 0]; // [xx, yy]
        var circle_radius = 10; // just to make sure
        var circle_click = 0;
        var square_loc = null; // [xx, yy]
        var square_size = 40; // just to make sure
        var square_click = 0;
        var square_escape = 0;
        var square_dead = false;
        var message_loc = [0, 0]; // [xx, yy]
        var stim_history = [];
        var click_history = [];
        var mouse_track = [];
        var award_count = 0;

        // handle the overall task timing
        if (trial.time_remain < 0) {
            // finish the trial right now
            jsPsych.pluginAPI.setTimeout(function () {
                endTrial(91); // Time is already up. Skipping this trial.
            }, 0);
        } else if (trial.time_remain != Infinity) {
            // finish the trial when time is up
            jsPsych.pluginAPI.setTimeout(function () {
                endTrial(99); // Time is up. Finishing this trial.
            }, trial.time_remain);
        }

        /* 
            now process the game-board HTML 
        */

        // sound related
        var sound_steal = new Audio(trial.sound_steal);
        var sound_gunshot = new Audio(trial.sound_gunshot);
        var sound_dying = new Audio(trial.sound_dying);
        var sound_escape = new Audio(trial.sound_escape);

        // setup the audio stimuli
        function showTimer() {
            var diff = trial.time_remain - (performance.now() - trial_onset);
            if (diff > 0) {
                var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                minutes = (minutes < 10) ? "0" + minutes : minutes;
                var seconds = Math.floor((diff % (1000 * 60)) / 1000);
                seconds = (seconds < 10) ? "0" + seconds : seconds;
                jQuery("#jspsych-timer").text(minutes + ':' + seconds);
            } else {
                jQuery("#jspsych-timer").text('00:00');
            }
        }

        // if prompt is set, show prompt
        if (trial.prompt !== null) {
            display_element.innerHTML = trial.prompt;
        }

        // initializing the game board
        display_element.innerHTML +=
            '<div class="game-message">' +
            '<div id="score-text" style="width:500px">Cents: <span id="jspsych-current-point"></span></div>' +
            '<div id="timer-text" style="flex-grow:1;text-align:right">Time left: <span id="jspsych-timer"></span></div>' +
            '</div>' + // upper game message
            '<div id="game-board">' +
            '<div id="green-circle"></div>' +
            '<div id="red-square"><img id="robber"><div class="square-content"><div><span id="jspsych-steal-amount"></span></div></div></img></div>' +
            '<div id="message-box"><div class="square-content"><div><span id="jspsych-float-message"></span></div></div></div>' +
            '</div>' +
            '<div class="game-message">' +
            '<div id="escape-text" style="width:640px;color:red;font-weight:bold"><span id="jspsych-robber-escape"></span></div>' +
            '<div id="harvest-text" style="width:160px;flex-grow:1;color:green;font-size:20px">Progrés: <span id="jspsych-harvest-progress"></span></div>' +
            '</div>'; // lower game message
        //display_element.innerHTML += 'Points: <span id="jspsych-current-point"></span>';
        //display_element.innerHTML += '<br>Time left: <span id="jspsych-timer"></span>';
        document.getElementById("game-board").style.width = trial.canvas_size[0];
        document.getElementById("game-board").style.height = trial.canvas_size[1];
        document.getElementById("robber").src = trial.robber_happy;
        jQuery("#jspsych-current-point").text(trial.start_points.toString());
        jQuery("#jspsych-harvest-progress").text(circle_click.toString() + ' / ' + trial.harvest_click.toString());
        // timer-related
        if (trial.time_remain == Infinity) {
            jQuery("#jspsych-timer").text('NO LIMIT');
        } else {
            showTimer();
            timerInterval = setInterval(showTimer, 100);
        }

        // less important stuff
        document.getElementById("green-circle").style.cursor = "grabbing";
        document.getElementById("green-circle").style.userSelect = "none";
        document.getElementById("red-square").style.display = "none";
        document.getElementById("red-square").style.cursor = "crosshair";
        document.getElementById("red-square").style.userSelect = "none";
        document.getElementById("message-box").style.display = "none";
        document.getElementById("message-box").style.userSelect = "none";
        jQuery("#jspsych-steal-amount").text(trial.steal_amount.toString());
        document.getElementById("jspsych-steal-amount").style.fontSize = "24px";
        document.getElementById("jspsych-steal-amount").style.verticalAlign = "top";
        document.getElementById("jspsych-steal-amount").style.userSelect = "none";



        //jQuery("#jspsych-float-message").text('HELLO');

        // defined the green-circle behavior
        function jumpRedSquare() {
            var flag_ok = false;
            while (flag_ok == false) {
                // determine the new location that satify
                // 1. the dist between old loc and new loc must be larger than the min dist
                var new_loc = [Math.round(Math.random() * (trial.canvas_size[0] - square_size)),
                    Math.round(Math.random() * (trial.canvas_size[1] - square_size))
                ]; // should be [xx, yy]
                if (square_loc == null) {
                    // we don't have to consider the square
                    flag_ok = (Math.hypot(new_loc[0] - circle_loc[0], new_loc[1] - circle_loc[1]) > trial.min_jump_dist);
                } else {
                    flag_ok = ((Math.hypot(new_loc[0] - circle_loc[0], new_loc[1] - circle_loc[1]) > trial.min_jump_dist) &&
                        (Math.hypot(new_loc[0] - square_loc[0], new_loc[1] - square_loc[1]) > trial.min_jump_dist));
                }
            }

            // present in the new location
            square_loc = new_loc;
            document.getElementById("red-square").style.display = "block";
            document.getElementById("red-square").style.left = square_loc[0] + "px"; // xx
            document.getElementById("red-square").style.top = square_loc[1] + "px"; // yy
            stim_history.push({
                "time": Math.round(performance.now() - trial_onset),
                "sx": square_loc[0] + square_size / 2, // center
                "sy": square_loc[1] + square_size / 2,
                "stim": "red-square"
            });
            // put escape message:
            jQuery("#jspsych-robber-escape").text('El lladre s´escaparà amb els teus punts després de ' + square_escape.toString() + ' clics!');
            /*
            if (trial.escape_before_harvest) {
                jQuery("#jspsych-robber-escape").text('El lladre ja no hi serà després de la teva collita!');
            } else {
                jQuery("#jspsych-robber-escape").text('El lladre s´escaparà amb els teus punts després de ' + square_escape.toString() + ' clics!');
            }
            */
        }

        function redSquareEscape() {
            // the red square successfully escapes!
            document.getElementById("red-square").style.display = "none";
            // deliver the bad news
            message_loc = Array.from(square_loc);
            jQuery("#jspsych-float-message").text('Poof!');
            document.getElementById("message-box").style.display = "block";
            document.getElementById("message-box").style.fontSize = "32px";
            document.getElementById("message-box").style.left = (message_loc[0] - 40).valueOf() + "px";
            document.getElementById("message-box").style.top = (message_loc[1] - 10).valueOf() + "px";
            jQuery("#jspsych-robber-escape").text('El lladre se n´ha anat tot content amb els teus punts!');
            sound_escape.play();
            jsPsych.pluginAPI.setTimeout(function () {
                document.getElementById("message-box").style.display = "none";
            }, 1000);
            jsPsych.pluginAPI.setTimeout(function () {
                jQuery("#jspsych-robber-escape").text('');
            }, 5000);
        }

        document.getElementById("red-square").onclick = function (evt) {

            // if square_dead is true, then it is done for this trial
            if (square_dead == false) {
                // gun shot!
                sound_gunshot.play();

                // CRITICAL MANIPULATION!! -- resetting the circle click count
                circle_click = 0;
                jQuery("#jspsych-harvest-progress").text(circle_click.toString() + ' / ' + trial.harvest_click.toString());

                // increase the click count
                square_click = square_click + 1;

                // send the click log
                var rect = document.getElementById("game-board").getBoundingClientRect();
                clickLogger({
                    "time": Math.round(performance.now() - trial_onset),
                    "cx": Math.round(evt.clientX - rect.left),
                    "cy": Math.round(evt.clientY - rect.top),
                    "stim": 'red-square'
                });

                if (square_click >= trial.kill_click) {
                    // turn off the red-square click function
                    square_dead = true;

                    // deliver the good news
                    document.getElementById("red-square").style.display = "block";
                    document.getElementById("robber").src = trial.robber_dead;
                    jQuery("#jspsych-steal-amount").text('');

                    // give the points back
                    if (trial.takeback_amount > 0) {
                        points_trial = points_trial + trial.takeback_amount;
                        jQuery("#jspsych-current-point").text((points_trial + trial.start_points).toString());

                        message_loc = Array.from(square_loc);
                        jQuery("#jspsych-float-message").text('+' + trial.takeback_amount.toString());
                        document.getElementById("message-box").style.display = "block";
                        document.getElementById("message-box").style.fontSize = "44px";
                        document.getElementById("message-box").style.left = (message_loc[0] - 40).valueOf() + "px";
                        document.getElementById("message-box").style.top = (message_loc[1] - 40).valueOf() + "px";
                        jQuery("#jspsych-robber-escape").text('The robber bit the dust. You got ' + trial.takeback_amount.toString() + ' points back.');
                    } else {
                        jQuery("#jspsych-robber-escape").text('El lladre ha mossegat la pols.');
                    }

                    sound_dying.play();
                    jsPsych.pluginAPI.setTimeout(function () {
                        document.getElementById("message-box").style.display = "none";
                    }, trial.refractory_period * 2);
                    jsPsych.pluginAPI.setTimeout(function () {
                        document.getElementById("red-square").style.display = "none";
                        jQuery("#jspsych-robber-escape").text('');
                    }, 5000);

                    if (trial.shoot_prac == true) {
                        // the practice trial ends when the robber dies
                        jsPsych.pluginAPI.setTimeout(function () {
                            endTrial(9);
                        }, 5000);
                    }

                } else {
                    if (square_escape > 1) {
                        square_escape = square_escape - 1;
                        // continue this trial: jump the red square
                        document.getElementById("red-square").style.display = "none";
                        jsPsych.pluginAPI.setTimeout(function () {
                            jumpRedSquare();
                        }, trial.refractory_period);
                    } else {
                        redSquareEscape();
                        return;
                    }
                }
            }
        }

        function jumpGreenCircle() {
            var flag_ok = false;
            while (flag_ok == false) {
                // determine the new location that satify
                // 1. the dist between old loc and new loc must be larger than the min dist
                // AND 2. the dist between new loc and sqaure loc must be larger than the min dist
                var new_loc = [Math.round(Math.random() * (trial.canvas_size[0] - 2 * circle_radius)),
                    Math.round(Math.random() * (trial.canvas_size[1] - 2 * circle_radius))
                ]; // should be [xx, yy]
                if (document.getElementById("red-square").style.display === "none") {
                    // we don't have to consider the square
                    flag_ok = (Math.hypot(new_loc[0] - circle_loc[0], new_loc[1] - circle_loc[1]) > trial.min_jump_dist);
                } else {
                    flag_ok = ((Math.hypot(new_loc[0] - circle_loc[0], new_loc[1] - circle_loc[1]) > trial.min_jump_dist) &&
                        (Math.hypot(new_loc[0] - square_loc[0], new_loc[1] - square_loc[1]) > trial.min_jump_dist));
                }
            }

            // present in the new location
            circle_loc = new_loc;
            document.getElementById("green-circle").style.display = "block";
            document.getElementById("green-circle").style.left = circle_loc[0] + "px"; // xx
            document.getElementById("green-circle").style.top = circle_loc[1] + "px"; // yy
            stim_history.push({
                "time": Math.round(performance.now() - trial_onset),
                "sx": circle_loc[0] + circle_radius, // center
                "sy": circle_loc[1] + circle_radius,
                "stim": "green-circle"
            });

            // update the harvest score
            jQuery("#jspsych-harvest-progress").text(circle_click.toString() + ' / ' + trial.harvest_click.toString());
        }

        // initializing the green circle location
        if (trial.shoot_prac == false) {
            if (trial.prev_circle_loc == null) {
                // if prev_circle_loc not provided, just put the circle at the center
                circle_loc = [(trial.canvas_size[0] / 2 - circle_radius), (trial.canvas_size[1] / 2 - circle_radius)]; // xx, yy
                document.getElementById("green-circle").style.left = circle_loc[0] + "px"; // xx
                document.getElementById("green-circle").style.top = circle_loc[1] + "px"; // yy
                stim_history.push({
                    "time": Math.round(performance.now() - trial_onset),
                    "sx": circle_loc[0] + circle_radius, // center
                    "sy": circle_loc[1] + circle_radius,
                    "stim": "green-circle"
                });
            } else {
                circle_loc = trial.prev_circle_loc;
                jumpGreenCircle();
            }
        } else {
            if (flag_debug) {
                console.log('Tirs de pràctica: han de ser al cercle verd.')
            }
            circle_loc = [(trial.canvas_size[0] / 2 - circle_radius), (trial.canvas_size[1] / 2 - circle_radius)]; // xx, yy
            document.getElementById("green-circle").style.display = "none";
            // present the red-square
            if (trial.escape_before_harvest) {
                square_escape = (trial.harvest_click - 1) - trial.steal_timing;
                if (square_escape < trial.kill_click) {
                    square_escape = trial.kill_click;
                    console.log('AVÍS: EL TEMPS DE ROBATORI ÉS MASSA PROPER A LA COLLITA.');
                }
            } else {
                square_escape = trial.escape_click;
            }
            jumpRedSquare();
        }

        function clickLogger(evt) {
            click_history.push({
                "time": evt.time,
                "cx": evt.cx,
                "cy": evt.cy,
                "stim": evt.stim
            });
            if (flag_debug) {
                console.log("Click time, x, y, stim = " + evt.time + ", " + evt.cx + ", " + evt.cy + ", " + evt.stim);
                console.log(click_history);
            }
        }

        document.getElementById("green-circle").onclick = function (evt) {

            // hide the circle
            document.getElementById("green-circle").style.display = "none";

            // increase the click count
            circle_click = circle_click + 1;
            jQuery("#jspsych-harvest-progress").text(circle_click.toString() + ' / ' + trial.harvest_click.toString());

            // while clicking the green circle, the red square can escape
            if (document.getElementById("red-square").style.display == "block") {
                if (square_dead == false) {
                    if (square_escape > 1) {
                        square_escape = square_escape - 1;
                        jQuery("#jspsych-robber-escape").text('El lladre s´escaparà amb els teus punts després de ' + square_escape.toString() + ' clics!');
                        /*
                        if (trial.escape_with_harvest) {
                            jQuery("#jspsych-robber-escape").text('El lladre no hi serà després de la teva collita!');
                        } else {
                            jQuery("#jspsych-robber-escape").text('El lladre s´escaparà amb els teus punts després de ' + square_escape.toString() + ' clics!');
                        }
                        */
                    } else {
                        redSquareEscape();
                    }
                }
            }

            // send the click log
            var rect = document.getElementById("game-board").getBoundingClientRect();
            clickLogger({
                "time": Math.round(performance.now() - trial_onset),
                "cx": Math.round(evt.clientX - rect.left),
                "cy": Math.round(evt.clientY - rect.top),
                "stim": 'green-circle'
            });

            // if click_history reaches the steal_timing, bring in the red-square
            if (click_history.length == trial.steal_timing) {
                // steal the points
                points_trial = points_trial - trial.steal_amount;
                jQuery("#jspsych-current-point").text((points_trial + trial.start_points).toString());

                // deliver the bad news
                message_loc = Array.from(circle_loc);
                jQuery("#jspsych-float-message").text('Oh no! -' + trial.steal_amount);
                document.getElementById("message-box").style.display = "block";
                document.getElementById("message-box").style.fontSize = "32px";
                document.getElementById("message-box").style.left = (message_loc[0] - 50).valueOf() + "px";
                document.getElementById("message-box").style.top = (message_loc[1] - 20).valueOf() + "px";
                jsPsych.pluginAPI.setTimeout(function () {
                    document.getElementById("message-box").style.display = "none";
                }, 3000); // display oh-no for 3 sec

                // present the red-square
                if (trial.escape_before_harvest) {
                    square_escape = (trial.harvest_click - 1) - trial.steal_timing;
                    if (square_escape < trial.kill_click) {
                        square_escape = trial.kill_click;
                        console.log('AVÍS: EL TEMPS DE ROBATORI ÉS MASSA PROPER A LA COLLITA.');
                    }
                } else {
                    square_escape = trial.escape_click;
                }
                jumpRedSquare();
                sound_steal.play();
            }

            // reached the threshold for point?
            if (circle_click >= trial.harvest_click) {
                points_trial = points_trial + trial.harvest_amount;
                jQuery("#jspsych-current-point").text((points_trial + trial.start_points).toString());
                circle_click = 0;

                // deliver the good news
                message_loc = Array.from(circle_loc);
                jQuery("#jspsych-float-message").text('+' + trial.harvest_amount.toString());
                document.getElementById("message-box").style.display = "block";
                document.getElementById("message-box").style.fontSize = "44px";
                document.getElementById("message-box").style.left = (message_loc[0] - 50).valueOf() + "px";
                document.getElementById("message-box").style.top = (message_loc[1] - 20).valueOf() + "px";
                jsPsych.pluginAPI.setTimeout(function () {
                    document.getElementById("message-box").style.display = "none";
                }, trial.refractory_period - 50);

                award_count = award_count + 1;
                if (award_count >= trial.max_award_count) {
                    jsPsych.pluginAPI.setTimeout(function () {
                        endTrial(1);
                    }, trial.refractory_period);
                } else {
                    // continue this trial: jump the green circle
                    jsPsych.pluginAPI.setTimeout(function () {
                        jumpGreenCircle();
                    }, trial.refractory_period);
                }
            } else {
                // continue this trial: jump the green circle
                jsPsych.pluginAPI.setTimeout(function () {
                    jumpGreenCircle();
                }, trial.refractory_period);
            }
        }

        // activate the mouse tracking
        function record_mousepos(e) {
            var width_cnt = window.innerWidth / 2;
            var height_cnt = window.innerHeight / 2;
            var curr_smp = [Math.round(performance.now() - trial_onset), (e.pageX - width_cnt), (e.pageY - height_cnt), 0];
            if (flag_debug) {
                // console.log("mouse: ", curr_smp);
            }
            mouse_track.push(curr_smp);
        }

        function record_mousedown(e) {
            var width_cnt = window.innerWidth / 2;
            var height_cnt = window.innerHeight / 2;
            var curr_smp = [Math.round(performance.now() - trial_onset), (e.pageX - width_cnt), (e.pageY - height_cnt), 1];
            if (flag_debug) {
                // console.log("mouse: ", curr_smp);
            }
            mouse_track.push(curr_smp);
        }
        jQuery(document).mousemove(record_mousepos);
        jQuery(document).mousedown(record_mousedown);

        function endTrial(finish_code) {
            if (flag_debug) {
                switch (finish_code) {
                    case 1:
                        console.log("El màxim de punts ha estat assolit. Continuem al següent assaig.");
                        break;
                    case 9:
                        console.log("Els tirs de pràctica s´han acabat. Continuem al següent assaig.");
                        break;
                    case 91:
                        console.log("El temps ja s´ha acabat. Saltant aquest assaig.");
                        break;
                    case 99:
                        console.log("El temps s´ha acabat. Acabant aquest assaig.");
                        break;
                    default:
                        console.log("CODI ESTRANY!!");
                }
            }

            display_element.innerHTML = '';
            var rt = Math.round(performance.now() - trial_onset);
            var wasted_click = click_history.length - (trial.max_award_count * trial.harvest_click);
            var trial_data = {
                "finish_code": finish_code,
                "rt": rt,
                "time_remain": Math.round(trial.time_remain - rt),
                "points_trial": points_trial,
                "wasted_click": wasted_click,
                "last_circle_loc": circle_loc,
                "stim_history": stim_history,
                "click_history": click_history
            };
            if (trial.record_mouse) {
                trial_data['mouse_track'] = mouse_track;
            }
            if (flag_debug) {
                console.log(trial_data);
            }

            // clear the sounds
            /*
            sound_steal.remove();
            sound_gunshot.remove();
            sound_dying.remove();
            sound_escape.remove();
            */

            // removing event handlers
            jQuery(document).off("mousemove", record_mousepos);
            jQuery(document).off("mousedown", record_mousedown);

            // kill any remaining setTimeout handlers
            clearInterval(timerInterval);
            jsPsych.pluginAPI.clearAllTimeouts();

            if (flag_debug) {
                console.log('Trial is finished.');
            }
            jsPsych.finishTrial(trial_data);
        }
    };

    return plugin;
})();
