var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 基础对象。
     * @version DragonBones 4.5
     */
    var BaseObject = (function () {
        /**
         * @private
         */
        function BaseObject() {
            /**
             * @language zh_CN
             * 对象的唯一标识。
             * @version DragonBones 4.5
             */
            this.hashCode = BaseObject._hashCode++;
        }
        var d = __define,c=BaseObject,p=c.prototype;
        BaseObject._returnObject = function (object) {
            var objectConstructor = object.constructor;
            var classType = String(objectConstructor);
            var maxCount = BaseObject._maxCountMap[classType] == null ? BaseObject._defaultMaxCount : BaseObject._maxCountMap[classType];
            var pool = BaseObject._poolsMap[classType] = BaseObject._poolsMap[classType] || [];
            if (pool.length < maxCount) {
                if (pool.indexOf(object) < 0) {
                    pool.push(object);
                }
                else {
                    throw new Error();
                }
            }
        };
        /**
         * @private
         */
        BaseObject.toString = function () {
            throw new Error();
        };
        /**
         * @language zh_CN
         * 设置每种对象池的最大缓存数量。
         * @param objectConstructor 对象类。
         * @param maxCount 最大缓存数量。 (设置为 0 则不缓存)
         * @version DragonBones 4.5
         */
        BaseObject.setMaxCount = function (objectConstructor, maxCount) {
            if (maxCount < 0 || maxCount != maxCount) {
                maxCount = 0;
            }
            if (objectConstructor) {
                var classType = String(objectConstructor);
                BaseObject._maxCountMap[classType] = maxCount;
                var pool = BaseObject._poolsMap[classType];
                if (pool && pool.length > maxCount) {
                    pool.length = maxCount;
                }
            }
            else {
                BaseObject._defaultMaxCount = maxCount;
                for (var classType in BaseObject._poolsMap) {
                    if (BaseObject._maxCountMap[classType] == null) {
                        continue;
                    }
                    var pool = BaseObject._poolsMap[classType];
                    if (pool.length > maxCount) {
                        pool.length = maxCount;
                    }
                }
            }
        };
        /**
         * @language zh_CN
         * 清除对象池缓存的对象。
         * @param objectConstructor 对象类。 (不设置则清除所有缓存)
         * @version DragonBones 4.5
         */
        BaseObject.clearPool = function (objectConstructor) {
            if (objectConstructor === void 0) { objectConstructor = null; }
            if (objectConstructor) {
                var pool = BaseObject._poolsMap[String(objectConstructor)];
                if (pool && pool.length) {
                    pool.length = 0;
                }
            }
            else {
                for (var iP in BaseObject._poolsMap) {
                    var pool = BaseObject._poolsMap[iP];
                    pool.length = 0;
                }
            }
        };
        /**
         * @language zh_CN
         * 从对象池中创建指定对象。
         * @param objectConstructor 对象类。
         * @version DragonBones 4.5
         */
        BaseObject.borrowObject = function (objectConstructor) {
            var pool = BaseObject._poolsMap[String(objectConstructor)];
            if (pool && pool.length) {
                return pool.pop();
            }
            else {
                var object = new objectConstructor();
                object._onClear();
                return object;
            }
        };
        /**
         * @language zh_CN
         * 清除数据并返还对象池。
         * @version DragonBones 4.5
         */
        p.returnToPool = function () {
            this._onClear();
            BaseObject._returnObject(this);
        };
        BaseObject._hashCode = 0;
        BaseObject._defaultMaxCount = 5000;
        BaseObject._maxCountMap = {};
        BaseObject._poolsMap = {};
        return BaseObject;
    }());
    dragonBones.BaseObject = BaseObject;
    egret.registerClass(BaseObject,'dragonBones.BaseObject');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 动画控制器，用来播放动画数据，管理动画状态。
     * @see dragonBones.AnimationData
     * @see dragonBones.AnimationState
     * @version DragonBones 3.0
     */
    var Animation = (function (_super) {
        __extends(Animation, _super);
        /**
         * @private
         */
        function Animation() {
            _super.call(this);
            /**
             * @private
             */
            this._animations = {};
            /**
             * @private
             */
            this._animationNames = [];
            /**
             * @private
             */
            this._animationStates = [];
        }
        var d = __define,c=Animation,p=c.prototype;
        /**
         * @private
         */
        Animation._sortAnimationState = function (a, b) {
            return a.layer > b.layer ? 1 : -1;
        };
        /**
         * @private
         */
        Animation.toString = function () {
            return "[Class dragonBones.Animation]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.timeScale = 1;
            self._animationStateDirty = false;
            self._timelineStateDirty = false;
            self._armature = null;
            self._isPlaying = false;
            self._time = 0;
            self._lastAnimationState = null;
            for (var i in self._animations) {
                delete self._animations[i];
            }
            if (self._animationNames.length) {
                self._animationNames.length = 0;
            }
            for (var i = 0, l = self._animationStates.length; i < l; ++i) {
                self._animationStates[i].returnToPool();
            }
            self._animationStates.length = 0;
        };
        /**
         * @private
         */
        p._fadeOut = function (fadeOutTime, layer, group, fadeOutMode, pauseFadeOut) {
            var self = this;
            var i = 0, l = self._animationStates.length;
            var animationState = null;
            switch (fadeOutMode) {
                case 0 /* None */:
                    break;
                case 1 /* SameLayer */:
                    for (; i < l; ++i) {
                        animationState = self._animationStates[i];
                        if (animationState.layer == layer) {
                            animationState.fadeOut(fadeOutTime, pauseFadeOut);
                        }
                    }
                    break;
                case 2 /* SameGroup */:
                    for (; i < l; ++i) {
                        animationState = self._animationStates[i];
                        if (animationState.group == group) {
                            animationState.fadeOut(fadeOutTime, pauseFadeOut);
                        }
                    }
                    break;
                case 4 /* All */:
                    for (; i < l; ++i) {
                        animationState = self._animationStates[i];
                        animationState.fadeOut(fadeOutTime, pauseFadeOut);
                    }
                    break;
                case 3 /* SameLayerAndGroup */:
                    for (; i < l; ++i) {
                        animationState = self._animationStates[i];
                        if (animationState.layer == layer && animationState.group == group) {
                            animationState.fadeOut(fadeOutTime, pauseFadeOut);
                        }
                    }
                    break;
            }
        };
        /**
         * @private
         */
        p._updateFFDTimelineStates = function () {
            var self = this;
            for (var i = 0, l = self._animationStates.length; i < l; ++i) {
                self._animationStates[i]._updateFFDTimelineStates();
            }
        };
        /**
         * @private
         */
        p._advanceTime = function (passedTime) {
            var self = this;
            if (!self._isPlaying) {
                return;
            }
            if (passedTime < 0) {
                passedTime = -passedTime;
            }
            var animationStateCount = self._animationStates.length;
            if (animationStateCount == 1) {
                var animationState = self._animationStates[0];
                if (animationState._isFadeOutComplete) {
                    animationState.returnToPool();
                    self._animationStates.length = 0;
                    self._animationStateDirty = true;
                    self._lastAnimationState = null;
                }
                else {
                    if (self._timelineStateDirty) {
                        animationState._updateTimelineStates();
                    }
                    animationState._advanceTime(passedTime, 1, 0);
                }
            }
            else if (animationStateCount > 1) {
                var prevLayer = self._animationStates[0]._layer;
                var weightLeft = 1;
                var layerTotalWeight = 0;
                var layerIndex = 1;
                for (var i = 0, r = 0; i < animationStateCount; ++i) {
                    var animationState = self._animationStates[i];
                    if (animationState._isFadeOutComplete) {
                        r++;
                        animationState.returnToPool();
                        if (self._lastAnimationState == animationState) {
                            if (i - r >= 0) {
                                self._lastAnimationState = self._animationStates[i - r];
                            }
                            else {
                                self._lastAnimationState = null;
                            }
                        }
                    }
                    else {
                        if (r > 0) {
                            self._animationStates[i - r] = animationState;
                        }
                        if (prevLayer != animationState._layer) {
                            prevLayer = animationState._layer;
                            if (layerTotalWeight >= weightLeft) {
                                weightLeft = 0;
                            }
                            else {
                                weightLeft -= layerTotalWeight;
                            }
                            layerTotalWeight = 0;
                        }
                        if (self._timelineStateDirty) {
                            animationState._updateTimelineStates();
                        }
                        animationState._advanceTime(passedTime, weightLeft, layerIndex);
                        if (animationState._weightResult != 0) {
                            layerTotalWeight += animationState._weightResult;
                            layerIndex++;
                        }
                    }
                    if (i == animationStateCount - 1 && r > 0) {
                        self._animationStates.length -= r;
                    }
                }
            }
            self._timelineStateDirty = false;
        };
        /**
         * @language zh_CN
         * 清除所有正在播放的动画状态。
         * @version DragonBones 4.5
         */
        p.reset = function () {
            var self = this;
            self._isPlaying = false;
            self._lastAnimationState = null;
            for (var i = 0, l = self._animationStates.length; i < l; ++i) {
                self._animationStates[i].returnToPool();
            }
            self._animationStates.length = 0;
        };
        /**
         * @language zh_CN
         * 暂停播放动画。
         * @param animationName 动画状态的名称，如果未设置，则暂停所有动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 3.0
         */
        p.stop = function (animationName) {
            if (animationName === void 0) { animationName = null; }
            if (animationName) {
                var animationState = this.getState(animationName);
                if (animationState) {
                    animationState.stop();
                }
            }
            else {
                this._isPlaying = false;
            }
        };
        /**
         * @language zh_CN
         * 播放动画。
         * @param animationName 动画数据的名称，如果未设置，则播放默认动画，或将暂停状态切换为播放状态，或重新播放上一个正在播放的动画。
         * @param playTimes 动画需要播放的次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 3.0
         */
        p.play = function (animationName, playTimes) {
            if (animationName === void 0) { animationName = null; }
            if (playTimes === void 0) { playTimes = -1; }
            var self = this;
            var animationState = null;
            if (animationName) {
                animationState = self.fadeIn(animationName, 0, playTimes, 0, null, 4 /* All */);
            }
            else if (!self._lastAnimationState) {
                var defaultAnimation = self._armature.armatureData.defaultAnimation;
                if (defaultAnimation) {
                    animationState = self.fadeIn(defaultAnimation.name, 0, playTimes, 0, null, 4 /* All */);
                }
            }
            else if (!self._isPlaying) {
                self._isPlaying = true;
            }
            else {
                animationState = self.fadeIn(self._lastAnimationState.name, 0, playTimes, 0, null, 4 /* All */);
            }
            return animationState;
        };
        /**
         * @language zh_CN
         * 淡入播放指定名称的动画。
         * @param animationName 动画数据的名称。
         * @param playTimes 循环播放的次数。 [-1: 使用数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @param fadeInTime 淡入的时间。 [-1: 使用数据默认值, [0~N]: N 秒淡入完毕] (以秒为单位)
         * @param layer 混合的图层，图层高会优先获取混合权重。
         * @param group 混合的组，用于给动画状态编组，方便混合淡出控制。
         * @param fadeOutMode 淡出的模式。
         * @param additiveBlending 以叠加的形式混合。
         * @param displayControl 是否对显示对象属性可控。
         * @param pauseFadeOut 暂停需要淡出的动画。
         * @param pauseFadeIn 暂停需要淡入的动画，直到淡入结束才开始播放。
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationFadeOutMode
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        p.fadeIn = function (animationName, fadeInTime, playTimes, layer, group, fadeOutMode, additiveBlending, displayControl, pauseFadeOut, pauseFadeIn) {
            if (fadeInTime === void 0) { fadeInTime = -1; }
            if (playTimes === void 0) { playTimes = -1; }
            if (layer === void 0) { layer = 0; }
            if (group === void 0) { group = null; }
            if (fadeOutMode === void 0) { fadeOutMode = 3 /* SameLayerAndGroup */; }
            if (additiveBlending === void 0) { additiveBlending = false; }
            if (displayControl === void 0) { displayControl = true; }
            if (pauseFadeOut === void 0) { pauseFadeOut = true; }
            if (pauseFadeIn === void 0) { pauseFadeIn = true; }
            var self = this;
            var clipData = self._animations[animationName];
            if (!clipData) {
                self._time = 0;
                console.warn("No animation.", " Armature: " + self._armature.name, " Animation: " + animationName);
                return null;
            }
            self._isPlaying = true;
            if (fadeInTime != fadeInTime || fadeInTime < 0) {
                if (self._lastAnimationState) {
                    fadeInTime = clipData.fadeInTime;
                }
                else {
                    fadeInTime = 0;
                }
            }
            if (playTimes < 0) {
                playTimes = clipData.playTimes;
            }
            self._fadeOut(fadeInTime, layer, group, fadeOutMode, pauseFadeOut);
            self._lastAnimationState = dragonBones.BaseObject.borrowObject(dragonBones.AnimationState);
            self._lastAnimationState._layer = layer;
            self._lastAnimationState._group = group;
            self._lastAnimationState.additiveBlending = additiveBlending;
            self._lastAnimationState.displayControl = displayControl;
            self._lastAnimationState._fadeIn(self._armature, clipData.animation || clipData, animationName, playTimes, clipData.position, clipData.duration, self._time, 1 / clipData.scale, fadeInTime, pauseFadeIn);
            self._animationStates.push(self._lastAnimationState);
            self._animationStateDirty = true;
            self._time = 0;
            if (self._animationStates.length > 1) {
                self._animationStates.sort(Animation._sortAnimationState);
            }
            var slots = self._armature.getSlots();
            for (var i = 0, l = slots.length; i < l; ++i) {
                var slot = slots[i];
                if (slot.inheritAnimation) {
                    var childArmature = slot.childArmature;
                    if (childArmature &&
                        childArmature.animation.hasAnimation(animationName) &&
                        !childArmature.animation.getState(animationName)) {
                        childArmature.animation.fadeIn(animationName);
                    }
                }
            }
            self._armature.advanceTime(0);
            return self._lastAnimationState;
        };
        /**
         * @language zh_CN
         * 指定名称的动画从指定时间开始播放。
         * @param animationName 动画数据的名称。
         * @param time 时间。 (以秒为单位)
         * @param playTimes 动画循环播放的次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        p.gotoAndPlayByTime = function (animationName, time, playTimes) {
            if (time === void 0) { time = 0; }
            if (playTimes === void 0) { playTimes = -1; }
            this._time = time;
            return this.fadeIn(animationName, 0, playTimes, 0, null, 4 /* All */);
        };
        /**
         * @language zh_CN
         * 指定名称的动画从指定帧开始播放。
         * @param animationName 动画数据的名称。
         * @param frame 帧。
         * @param playTimes 动画循环播放的次数。[-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        p.gotoAndPlayByFrame = function (animationName, frame, playTimes) {
            if (frame === void 0) { frame = 0; }
            if (playTimes === void 0) { playTimes = -1; }
            var clipData = this._animations[animationName];
            if (clipData) {
                this._time = clipData.duration * frame / clipData.frameCount;
            }
            return this.fadeIn(animationName, 0, playTimes, 0, null, 4 /* All */);
        };
        /**
         * @language zh_CN
         * 指定名称的动画从指定进度开始播放。
         * @param animationName 动画数据的名称。
         * @param progress 进度。 [0~1]
         * @param playTimes 动画循环播放的次数。[-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        p.gotoAndPlayByProgress = function (animationName, progress, playTimes) {
            if (progress === void 0) { progress = 0; }
            if (playTimes === void 0) { playTimes = -1; }
            var clipData = this._animations[animationName];
            if (clipData) {
                this._time = clipData.duration * Math.max(progress, 0);
            }
            return this.fadeIn(animationName, 0, playTimes, 0, null, 4 /* All */);
        };
        /**
         * @language zh_CN
         * 播放指定名称的动画到指定的时间并停止。
         * @param animationName 动画数据的名称。
         * @param time 时间。 (以秒为单位)
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        p.gotoAndStopByTime = function (animationName, time) {
            if (time === void 0) { time = 0; }
            var animationState = this.gotoAndPlayByTime(animationName, time, 1);
            if (animationState) {
                this._isPlaying = false;
                animationState.stop();
            }
            return animationState;
        };
        /**
         * @language zh_CN
         * 播放指定名称的动画到指定的帧并停止。
         * @param animationName 动画数据的名称。
         * @param frame 帧。
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        p.gotoAndStopByFrame = function (animationName, frame) {
            if (frame === void 0) { frame = 0; }
            var animationState = this.gotoAndPlayByFrame(animationName, frame, 1);
            if (animationState) {
                this._isPlaying = false;
                animationState.stop();
            }
            return animationState;
        };
        /**
         * @language zh_CN
         * 播放指定名称的动画到指定的进度并停止。
         * @param animationName 动画数据的名称。
         * @param progress 进度。 [0~1]
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        p.gotoAndStopByProgress = function (animationName, progress) {
            if (progress === void 0) { progress = 0; }
            var animationState = this.gotoAndPlayByProgress(animationName, progress, 1);
            if (animationState) {
                this._isPlaying = false;
                animationState.stop();
            }
            return animationState;
        };
        /**
         * @language zh_CN
         * 获取指定名称的动画状态。
         * @param animationName 动画状态的名称。
         * @see dragonBones.AnimationState
         * @version DragonBones 3.0
         */
        p.getState = function (animationName) {
            for (var i = 0, l = this._animationStates.length; i < l; ++i) {
                var animationState = this._animationStates[i];
                if (animationState.name == animationName) {
                    return animationState;
                }
            }
            return null;
        };
        /**
         * @language zh_CN
         * 是否包含指定名称的动画数据。
         * @param animationName 动画数据的名称。
         * @see dragonBones.AnimationData
         * @version DragonBones 3.0
         */
        p.hasAnimation = function (animationName) {
            return this._animations[animationName] != null;
        };
        d(p, "isPlaying"
            /**
             * @language zh_CN
             * 动画是否处于播放状态。
             * @version DragonBones 3.0
             */
            ,function () {
                return this._isPlaying;
            }
        );
        d(p, "isCompleted"
            /**
             * @language zh_CN
             * 所有动画状态是否均已播放完毕。
             * @see dragonBones.AnimationState
             * @version DragonBones 3.0
             */
            ,function () {
                var self = this;
                if (self._lastAnimationState) {
                    if (!self._lastAnimationState.isCompleted) {
                        return false;
                    }
                    for (var i = 0, l = self._animationStates.length; i < l; ++i) {
                        if (!self._animationStates[i].isCompleted) {
                            return false;
                        }
                    }
                }
                return true;
            }
        );
        d(p, "lastAnimationName"
            /**
             * @language zh_CN
             * 上一个正在播放的动画状态的名称。
             * @see #lastAnimationState
             * @version DragonBones 3.0
             */
            ,function () {
                return this._lastAnimationState ? this._lastAnimationState.name : null;
            }
        );
        d(p, "lastAnimationState"
            /**
             * @language zh_CN
             * 上一个正在播放的动画状态。
             * @see dragonBones.AnimationState
             * @version DragonBones 3.0
             */
            ,function () {
                return this._lastAnimationState;
            }
        );
        d(p, "animationNames"
            /**
             * @language zh_CN
             * 所有动画数据名称。
             * @see #animations
             * @version DragonBones 4.5
             */
            ,function () {
                return this._animationNames;
            }
        );
        d(p, "animations"
            /**
             * @language zh_CN
             * 所有的动画数据。
             * @see dragonBones.AnimationData
             * @version DragonBones 4.5
             */
            ,function () {
                return this._animations;
            }
            ,function (value) {
                var self = this;
                if (self._animations == value) {
                    return;
                }
                for (var i in self._animations) {
                    delete self._animations[i];
                }
                self._animationNames.length = 0;
                if (value) {
                    for (var i in value) {
                        self._animations[i] = value[i];
                        self._animationNames.push(i);
                    }
                }
            }
        );
        /**
         * @deprecated
         * @see #play()
         * @see #fadeIn()
         * @see #gotoAndPlayByTime()
         * @see #gotoAndPlayByFrame()
         * @see #gotoAndPlayByProgress()
         */
        p.gotoAndPlay = function (animationName, fadeInTime, duration, playTimes, layer, group, fadeOutMode, pauseFadeOut, pauseFadeIn) {
            if (fadeInTime === void 0) { fadeInTime = -1; }
            if (duration === void 0) { duration = -1; }
            if (playTimes === void 0) { playTimes = -1; }
            if (layer === void 0) { layer = 0; }
            if (group === void 0) { group = null; }
            if (fadeOutMode === void 0) { fadeOutMode = 3 /* SameLayerAndGroup */; }
            if (pauseFadeOut === void 0) { pauseFadeOut = true; }
            if (pauseFadeIn === void 0) { pauseFadeIn = true; }
            var animationState = this.fadeIn(animationName, fadeInTime, playTimes, layer, group, fadeOutMode, false, true, pauseFadeOut, pauseFadeIn);
            if (animationState && duration && duration > 0) {
                animationState.timeScale = animationState.totalTime / duration;
            }
            return animationState;
        };
        /**
         * @deprecated
         * @see #gotoAndStopByTime()
         * @see #gotoAndStopByFrame()
         * @see #gotoAndStopByProgress()
         */
        p.gotoAndStop = function (animationName, time) {
            if (time === void 0) { time = 0; }
            return this.gotoAndStopByTime(animationName, time);
        };
        d(p, "animationList"
            /**
             * @deprecated
             * @see #animationNames
             * @see #animations
             */
            ,function () {
                return this._animationNames;
            }
        );
        d(p, "animationDataList"
            /**
             * @language zh_CN
             * @deprecated
             * @see #animationNames
             * @see #animations
             */
            ,function () {
                var list = [];
                for (var i = 0, l = this._animationNames.length; i < l; ++i) {
                    list.push(this._animations[this._animationNames[i]]);
                }
                return list;
            }
        );
        return Animation;
    }(dragonBones.BaseObject));
    dragonBones.Animation = Animation;
    egret.registerClass(Animation,'dragonBones.Animation');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 动画状态，播放动画时产生，可以对单个动画的播放进行更细致的控制和调节。
     * @see dragonBones.Animation
     * @see dragonBones.AnimationData
     * @version DragonBones 3.0
     */
    var AnimationState = (function (_super) {
        __extends(AnimationState, _super);
        /**
         * @private
         */
        function AnimationState() {
            _super.call(this);
            /**
             * @private
             */
            this._boneMask = [];
            /**
             * @private
             */
            this._boneTimelines = [];
            /**
             * @private
             */
            this._slotTimelines = [];
            /**
             * @private
             */
            this._ffdTimelines = [];
            /**
             * @deprecated
             */
            this.autoTween = false;
        }
        var d = __define,c=AnimationState,p=c.prototype;
        /**
         * @private
         */
        AnimationState.toString = function () {
            return "[Class dragonBones.AnimationState]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.displayControl = true;
            self.additiveBlending = false;
            self.playTimes = 1;
            self.timeScale = 1;
            self.weight = 1;
            self.autoFadeOutTime = -1;
            self.fadeTotalTime = 0;
            self._isFadeOutComplete = false;
            self._layer = 0;
            self._position = 0;
            self._duration = 0;
            self._weightResult = 0;
            self._fadeProgress = 0;
            self._group = null;
            if (self._timeline) {
                self._timeline.returnToPool();
                self._timeline = null;
            }
            self._isPlaying = true;
            self._isPausePlayhead = false;
            self._isFadeOut = false;
            self._currentPlayTimes = 0;
            self._fadeTime = 0;
            self._time = 0;
            self._name = null;
            self._armature = null;
            self._animationData = null;
            if (self._boneMask.length) {
                self._boneMask.length = 0;
            }
            for (var i = 0, l = self._boneTimelines.length; i < l; ++i) {
                self._boneTimelines[i].returnToPool();
            }
            for (var i = 0, l = self._slotTimelines.length; i < l; ++i) {
                self._slotTimelines[i].returnToPool();
            }
            for (var i = 0, l = self._ffdTimelines.length; i < l; ++i) {
                self._ffdTimelines[i].returnToPool();
            }
            self._boneTimelines.length = 0;
            self._slotTimelines.length = 0;
            self._ffdTimelines.length = 0;
        };
        /**
         * @private
         */
        p._advanceFadeTime = function (passedTime) {
            var self = this;
            if (passedTime < 0) {
                passedTime = -passedTime;
            }
            self._fadeTime += passedTime;
            var fadeProgress = 0;
            if (self._fadeTime >= self.fadeTotalTime) {
                fadeProgress = self._isFadeOut ? 0 : 1;
            }
            else if (self._fadeTime > 0) {
                fadeProgress = self._isFadeOut ? (1 - self._fadeTime / self.fadeTotalTime) : (self._fadeTime / self.fadeTotalTime);
            }
            else {
                fadeProgress = self._isFadeOut ? 1 : 0;
            }
            if (self._fadeProgress != fadeProgress) {
                self._fadeProgress = fadeProgress;
                var eventDispatcher = self._armature._display;
                if (self._fadeTime <= passedTime) {
                    if (self._isFadeOut) {
                        if (eventDispatcher.hasEvent(dragonBones.EventObject.FADE_OUT)) {
                            var event_1 = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            event_1.animationState = this;
                            self._armature._bufferEvent(event_1, dragonBones.EventObject.FADE_OUT);
                        }
                    }
                    else {
                        if (eventDispatcher.hasEvent(dragonBones.EventObject.FADE_IN)) {
                            var event_2 = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            event_2.animationState = this;
                            self._armature._bufferEvent(event_2, dragonBones.EventObject.FADE_IN);
                        }
                    }
                }
                if (self._fadeTime >= self.fadeTotalTime) {
                    if (self._isFadeOut) {
                        self._isFadeOutComplete = true;
                        if (eventDispatcher.hasEvent(dragonBones.EventObject.FADE_OUT_COMPLETE)) {
                            var event_3 = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            event_3.animationState = this;
                            self._armature._bufferEvent(event_3, dragonBones.EventObject.FADE_OUT_COMPLETE);
                        }
                    }
                    else {
                        self._isPausePlayhead = false;
                        if (eventDispatcher.hasEvent(dragonBones.EventObject.FADE_IN_COMPLETE)) {
                            var event_4 = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            event_4.animationState = this;
                            self._armature._bufferEvent(event_4, dragonBones.EventObject.FADE_IN_COMPLETE);
                        }
                    }
                }
            }
        };
        /**
         * @private
         */
        p._isDisabled = function (slot) {
            if (this.displayControl &&
                (!slot.displayController ||
                    slot.displayController == this._name ||
                    slot.displayController == this._group)) {
                return false;
            }
            return true;
        };
        /**
         * @private
         */
        p._fadeIn = function (armature, clip, animationName, playTimes, position, duration, time, timeScale, fadeInTime, pausePlayhead) {
            var self = this;
            self._armature = armature;
            self._animationData = clip;
            self._name = animationName;
            self.playTimes = playTimes;
            self.timeScale = timeScale;
            self.fadeTotalTime = fadeInTime;
            self._position = position;
            self._duration = duration;
            self._time = time;
            self._isPausePlayhead = pausePlayhead;
            if (self.fadeTotalTime == 0) {
                self._fadeProgress = 0.999999;
            }
            self._timeline = dragonBones.BaseObject.borrowObject(dragonBones.AnimationTimelineState);
            self._timeline.fadeIn(self._armature, self, self._animationData, self._time);
            self._updateTimelineStates();
        };
        /**
         * @private
         */
        p._updateTimelineStates = function () {
            var self = this;
            var time = self._time;
            if (!self._animationData.hasAsynchronyTimeline) {
                time = self._timeline._currentTime;
            }
            var boneTimelineStates = {};
            var slotTimelineStates = {};
            for (var i = 0, l = self._boneTimelines.length; i < l; ++i) {
                var boneTimelineState = self._boneTimelines[i];
                boneTimelineStates[boneTimelineState.bone.name] = boneTimelineState;
            }
            var bones = self._armature.getBones();
            for (var i = 0, l = bones.length; i < l; ++i) {
                var bone = bones[i];
                var boneTimelineName = bone.name;
                var boneTimelineData = self._animationData.getBoneTimeline(boneTimelineName);
                if (boneTimelineData && self.containsBoneMask(boneTimelineName)) {
                    var boneTimelineState = boneTimelineStates[boneTimelineName];
                    if (boneTimelineState) {
                        delete boneTimelineStates[boneTimelineName];
                    }
                    else {
                        boneTimelineState = dragonBones.BaseObject.borrowObject(dragonBones.BoneTimelineState);
                        boneTimelineState.bone = bone;
                        boneTimelineState.fadeIn(self._armature, this, boneTimelineData, time);
                        self._boneTimelines.push(boneTimelineState);
                    }
                }
            }
            for (var i in boneTimelineStates) {
                var boneTimelineState = boneTimelineStates[i];
                boneTimelineState.bone.invalidUpdate();
                self._boneTimelines.splice(self._boneTimelines.indexOf(boneTimelineState), 1);
                boneTimelineState.returnToPool();
            }
            //
            for (var i = 0, l = self._slotTimelines.length; i < l; ++i) {
                var slotTimelineState = self._slotTimelines[i];
                slotTimelineStates[slotTimelineState.slot.name] = slotTimelineState;
            }
            var slots = self._armature.getSlots();
            for (var i = 0, l = slots.length; i < l; ++i) {
                var slot = slots[i];
                var slotTimelineName = slot.name;
                var parentTimelineName = slot.parent.name;
                var slotTimelineData = self._animationData.getSlotTimeline(slotTimelineName);
                if (slotTimelineData && self.containsBoneMask(parentTimelineName) && !self._isFadeOut) {
                    var slotTimelineState = slotTimelineStates[slotTimelineName];
                    if (slotTimelineState) {
                        delete slotTimelineStates[slotTimelineName];
                    }
                    else {
                        slotTimelineState = dragonBones.BaseObject.borrowObject(dragonBones.SlotTimelineState);
                        slotTimelineState.slot = slot;
                        slotTimelineState.fadeIn(self._armature, this, slotTimelineData, time);
                        self._slotTimelines.push(slotTimelineState);
                    }
                }
            }
            for (var i in slotTimelineStates) {
                var slotTimelineState = slotTimelineStates[i];
                self._slotTimelines.splice(self._slotTimelines.indexOf(slotTimelineState), 1);
                slotTimelineState.returnToPool();
            }
            self._updateFFDTimelineStates();
        };
        /**
         * @private
         */
        p._updateFFDTimelineStates = function () {
            var self = this;
            var time = self._time;
            if (!self._animationData.hasAsynchronyTimeline) {
                time = self._timeline._currentTime;
            }
            var ffdTimelineStates = {};
            for (var i = 0, l = self._ffdTimelines.length; i < l; ++i) {
                var ffdTimelineState = self._ffdTimelines[i];
                ffdTimelineStates[ffdTimelineState.slot.name] = ffdTimelineState;
            }
            var slots = self._armature.getSlots();
            for (var i = 0, l = slots.length; i < l; ++i) {
                var slot = slots[i];
                var slotTimelineName = slot.name;
                var parentTimelineName = slot.parent.name;
                if (slot._meshData) {
                    var ffdTimelineData = self._animationData.getFFDTimeline(self._armature._skinData.name, slotTimelineName, slot.displayIndex);
                    if (ffdTimelineData && self.containsBoneMask(parentTimelineName)) {
                        var ffdTimelineState = ffdTimelineStates[slotTimelineName];
                        if (ffdTimelineState) {
                            delete ffdTimelineStates[slotTimelineName];
                        }
                        else {
                            ffdTimelineState = dragonBones.BaseObject.borrowObject(dragonBones.FFDTimelineState);
                            ffdTimelineState.slot = slot;
                            ffdTimelineState.fadeIn(self._armature, this, ffdTimelineData, time);
                            self._ffdTimelines.push(ffdTimelineState);
                        }
                    }
                    else {
                        for (var iF = 0, lF = slot._ffdVertices.length; iF < lF; ++iF) {
                            slot._ffdVertices[iF] = 0;
                        }
                        slot._ffdDirty = true;
                    }
                }
            }
            for (var i in ffdTimelineStates) {
                var ffdTimelineState = ffdTimelineStates[i];
                ffdTimelineState.slot._ffdDirty = true;
                self._ffdTimelines.splice(self._ffdTimelines.indexOf(ffdTimelineState), 1);
                ffdTimelineState.returnToPool();
            }
        };
        /**
         * @private
         */
        p._advanceTime = function (passedTime, weightLeft, index) {
            var self = this;
            if (passedTime != 0) {
                self._advanceFadeTime(passedTime);
            }
            // Update time.
            passedTime *= self.timeScale;
            if (passedTime != 0 && self._isPlaying && !self._isPausePlayhead) {
                self._time += passedTime;
            }
            // Blend weight.
            self._weightResult = self.weight * self._fadeProgress * weightLeft;
            if (self._weightResult != 0) {
                var isCacheEnabled = self._fadeProgress >= 1 && index == 0 && self._armature.cacheFrameRate > 0;
                var cacheTimeToFrameScale = self._animationData.cacheTimeToFrameScale;
                var isUpdatesTimeline = true;
                var isUpdatesBoneTimeline = true;
                var time = isCacheEnabled ? (Math.floor(self._time * cacheTimeToFrameScale) / cacheTimeToFrameScale) : self._time; // Cache time internval.
                // Update main timeline.                
                self._timeline.update(time);
                if (!self._animationData.hasAsynchronyTimeline) {
                    time = self._timeline._currentTime;
                }
                if (isCacheEnabled) {
                    var cacheFrameIndex = Math.floor(self._timeline._currentTime * cacheTimeToFrameScale);
                    if (self._armature._cacheFrameIndex == cacheFrameIndex) {
                        isUpdatesTimeline = false;
                        isUpdatesBoneTimeline = false;
                    }
                    else {
                        self._armature._cacheFrameIndex = cacheFrameIndex;
                        if (self._armature._animation._animationStateDirty) {
                            self._armature._animation._animationStateDirty = false;
                            for (var i = 0, l = self._boneTimelines.length; i < l; ++i) {
                                var boneTimeline = self._boneTimelines[i];
                                boneTimeline.bone._cacheFrames = boneTimeline._timeline.cachedFrames;
                            }
                            for (var i = 0, l = self._slotTimelines.length; i < l; ++i) {
                                var slotTimeline = self._slotTimelines[i];
                                slotTimeline.slot._cacheFrames = slotTimeline._timeline.cachedFrames;
                            }
                        }
                        if (self._animationData.cachedFrames[cacheFrameIndex]) {
                            isUpdatesBoneTimeline = false;
                        }
                        else {
                            self._animationData.cachedFrames[cacheFrameIndex] = true;
                        }
                    }
                }
                else {
                    self._armature._cacheFrameIndex = -1;
                }
                if (isUpdatesTimeline) {
                    if (isUpdatesBoneTimeline) {
                        for (var i = 0, l = self._boneTimelines.length; i < l; ++i) {
                            self._boneTimelines[i].update(time);
                        }
                    }
                    for (var i = 0, l = self._slotTimelines.length; i < l; ++i) {
                        self._slotTimelines[i].update(time);
                    }
                    for (var i = 0, l = self._ffdTimelines.length; i < l; ++i) {
                        self._ffdTimelines[i].update(time);
                    }
                }
            }
            if (self.autoFadeOutTime >= 0 && self._fadeProgress >= 1 && self._timeline._isCompleted) {
                self.fadeOut(self.autoFadeOutTime);
            }
        };
        /**
         * @language zh_CN
         * 继续播放。
         * @version DragonBones 3.0
         */
        p.play = function () {
            this._isPlaying = true;
        };
        /**
         * @language zh_CN
         * 暂停播放。
         * @version DragonBones 3.0
         */
        p.stop = function () {
            this._isPlaying = false;
        };
        /**
         * @language zh_CN
         * 淡出动画。
         * @param fadeOutTime 淡出时间。 (以秒为单位)
         * @param pausePlayhead 淡出时是否暂停动画。 [true: 暂停, false: 不暂停]
         * @version DragonBones 3.0
         */
        p.fadeOut = function (fadeOutTime, pausePlayhead) {
            if (pausePlayhead === void 0) { pausePlayhead = true; }
            var self = this;
            if (fadeOutTime < 0 || fadeOutTime != fadeOutTime) {
                fadeOutTime = 0;
            }
            self._isPausePlayhead = pausePlayhead;
            if (self._isFadeOut) {
                if (fadeOutTime > fadeOutTime - self._fadeTime) {
                    // If the animation is already in fade out, the new fade out will be ignored.
                    return;
                }
            }
            else {
                self._isFadeOut = true;
                if (fadeOutTime == 0 || self._fadeProgress <= 0) {
                    self._fadeProgress = 0.000001;
                }
                for (var i = 0, l = self._boneTimelines.length; i < l; ++i) {
                    self._boneTimelines[i].fadeOut();
                }
                for (var i = 0, l = self._slotTimelines.length; i < l; ++i) {
                    self._slotTimelines[i].fadeOut();
                }
            }
            self.displayControl = false;
            self.fadeTotalTime = self._fadeProgress > 0.000001 ? fadeOutTime / self._fadeProgress : 0;
            self._fadeTime = self.fadeTotalTime * (1 - self._fadeProgress);
        };
        /**
         * @language zh_CN
         * 是否包含指定的骨骼遮罩。
         * @param name 指定的骨骼名称。
         * @version DragonBones 3.0
         */
        p.containsBoneMask = function (name) {
            return !this._boneMask.length || this._boneMask.indexOf(name) >= 0;
        };
        /**
         * @language zh_CN
         * 添加指定的骨骼遮罩。
         * @param boneName 指定的骨骼名称。
         * @param recursive 是否为该骨骼的子骨骼添加遮罩。
         * @version DragonBones 3.0
         */
        p.addBoneMask = function (name, recursive) {
            if (recursive === void 0) { recursive = true; }
            var self = this;
            var currentBone = self._armature.getBone(name);
            if (!currentBone) {
                return;
            }
            if (self._boneMask.indexOf(name) < 0 &&
                self._animationData.getBoneTimeline(name)) {
                self._boneMask.push(name);
            }
            if (recursive) {
                var bones = self._armature.getBones();
                for (var i = 0, l = bones.length; i < l; ++i) {
                    var bone = bones[i];
                    var boneName = bone.name;
                    if (self._boneMask.indexOf(boneName) < 0 &&
                        self._animationData.getBoneTimeline(boneName) &&
                        currentBone.contains(bone)) {
                        self._boneMask.push(boneName);
                    }
                }
            }
            self._updateTimelineStates();
        };
        /**
         * @language zh_CN
         * 删除指定的骨骼遮罩。
         * @param boneName 指定的骨骼名称。
         * @param recursive 是否删除该骨骼的子骨骼遮罩。
         * @version DragonBones 3.0
         */
        p.removeBoneMask = function (name, recursive) {
            if (recursive === void 0) { recursive = true; }
            var self = this;
            var index = self._boneMask.indexOf(name);
            if (index >= 0) {
                self._boneMask.splice(index, 1);
            }
            if (recursive) {
                var currentBone = self._armature.getBone(name);
                if (currentBone) {
                    var bones = self._armature.getBones();
                    for (var i = 0, l = bones.length; i < l; ++i) {
                        var bone = bones[i];
                        var boneName = bone.name;
                        var index_1 = self._boneMask.indexOf(boneName);
                        if (index_1 >= 0 &&
                            currentBone.contains(bone)) {
                            self._boneMask.splice(index_1, 1);
                        }
                    }
                }
            }
            self._updateTimelineStates();
        };
        /**
         * @language zh_CN
         * 删除所有骨骼遮罩。
         * @version DragonBones 3.0
         */
        p.removeAllBoneMask = function () {
            this._boneMask.length = 0;
            this._updateTimelineStates();
        };
        d(p, "layer"
            /**
             * @language zh_CN
             * 动画图层。
             * @see dragonBones.Animation#fadeIn()
             * @version DragonBones 3.0
             */
            ,function () {
                return this._layer;
            }
        );
        d(p, "group"
            /**
             * @language zh_CN
             * 动画组。
             * @see dragonBones.Animation#fadeIn()
             * @version DragonBones 3.0
             */
            ,function () {
                return this._group;
            }
        );
        d(p, "name"
            /**
             * @language zh_CN
             * 动画名称。
             * @see dragonBones.AnimationData#name
             * @version DragonBones 3.0
             */
            ,function () {
                return this._name;
            }
        );
        d(p, "animationData"
            /**
             * @language zh_CN
             * 动画数据。
             * @see dragonBones.AnimationData
             * @version DragonBones 3.0
             */
            ,function () {
                return this._animationData;
            }
        );
        d(p, "isCompleted"
            /**
             * @language zh_CN
             * 是否播放完毕。
             * @version DragonBones 3.0
             */
            ,function () {
                return this._timeline._isCompleted;
            }
        );
        d(p, "isPlaying"
            /**
             * @language zh_CN
             * 是否正在播放。
             * @version DragonBones 3.0
             */
            ,function () {
                return (this._isPlaying && !this._timeline._isCompleted);
            }
        );
        d(p, "currentPlayTimes"
            /**
             * @language zh_CN
             * 当前动画的播放次数。
             * @version DragonBones 3.0
             */
            ,function () {
                return this._currentPlayTimes;
            }
        );
        d(p, "totalTime"
            /**
             * @language zh_CN
             * 当前动画的总时间。 (以秒为单位)
             * @version DragonBones 3.0
             */
            ,function () {
                return this._duration;
            }
        );
        d(p, "currentTime"
            /**
             * @language zh_CN
             * 当前动画的播放时间。 (以秒为单位)
             * @version DragonBones 3.0
             */
            ,function () {
                return this._timeline._currentTime;
            }
            ,function (value) {
                var self = this;
                if (value < 0 || value != value) {
                    value = 0;
                }
                self._time = value;
                self._timeline.setCurrentTime(self._time);
                if (self._weightResult != 0) {
                    var time = self._time;
                    if (!self._animationData.hasAsynchronyTimeline) {
                        time = self._timeline._currentTime;
                    }
                    for (var i = 0, l = self._boneTimelines.length; i < l; ++i) {
                        self._boneTimelines[i].setCurrentTime(time);
                    }
                    for (var i = 0, l = self._slotTimelines.length; i < l; ++i) {
                        self._slotTimelines[i].setCurrentTime(time);
                    }
                    for (var i = 0, l = self._ffdTimelines.length; i < l; ++i) {
                        self._ffdTimelines[i].setCurrentTime(time);
                    }
                }
            }
        );
        d(p, "clip"
            /**
             * @deprecated
             * @see #animationData
             * @version DragonBones 3.0
             */
            ,function () {
                return this._animationData;
            }
        );
        return AnimationState;
    }(dragonBones.BaseObject));
    dragonBones.AnimationState = AnimationState;
    egret.registerClass(AnimationState,'dragonBones.AnimationState');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var TimelineState = (function (_super) {
        __extends(TimelineState, _super);
        function TimelineState() {
            _super.call(this);
        }
        var d = __define,c=TimelineState,p=c.prototype;
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self._isCompleted = false;
            self._currentPlayTimes = 0;
            self._currentTime = 0;
            self._timeline = null;
            self._isReverse = false;
            self._hasAsynchronyTimeline = false;
            self._frameRate = 0;
            self._keyFrameCount = 0;
            self._frameCount = 0;
            self._position = 0;
            self._duration = 0;
            self._animationDutation = 0;
            self._timeScale = 1;
            self._timeOffset = 0;
            self._currentFrame = null;
            self._armature = null;
            self._animationState = null;
        };
        p._onFadeIn = function () { };
        p._onUpdateFrame = function (isUpdate) { };
        p._onArriveAtFrame = function (isUpdate) { };
        p._onCrossFrame = function (frame) { };
        p._setCurrentTime = function (value) {
            var self = this;
            var currentPlayTimes = 0;
            if (self._hasAsynchronyTimeline) {
                var playTimes = self._animationState.playTimes;
                var totalTimes = playTimes * self._duration;
                value *= self._timeScale;
                if (self._timeOffset != 0) {
                    value += self._timeOffset * self._animationDutation;
                }
                if (playTimes > 0 && (value >= totalTimes || value <= -totalTimes)) {
                    self._isCompleted = true;
                    currentPlayTimes = playTimes;
                    if (value < 0) {
                        value = 0;
                    }
                    else {
                        value = self._duration;
                    }
                }
                else {
                    self._isCompleted = false;
                    if (value < 0) {
                        currentPlayTimes = Math.floor(-value / self._duration);
                        value = self._duration - (-value % self._duration);
                    }
                    else {
                        currentPlayTimes = Math.floor(value / self._duration);
                        value %= self._duration;
                    }
                    if (playTimes > 0 && currentPlayTimes > playTimes) {
                        currentPlayTimes = playTimes;
                    }
                }
                value += self._position;
            }
            else {
                self._isCompleted = self._animationState._timeline._isCompleted;
                currentPlayTimes = self._animationState._timeline._currentPlayTimes;
            }
            if (self._currentTime == value) {
                return false;
            }
            if (self._keyFrameCount == 1 && value > self._position && this != self._animationState._timeline) {
                self._isCompleted = true;
            }
            self._isReverse = self._currentTime > value && self._currentPlayTimes == currentPlayTimes;
            self._currentTime = value;
            self._currentPlayTimes = currentPlayTimes;
            return true;
        };
        p.setCurrentTime = function (value) {
            var self = this;
            self._setCurrentTime(value);
            switch (self._keyFrameCount) {
                case 0:
                    break;
                case 1:
                    self._currentFrame = self._timeline.frames[0];
                    self._onArriveAtFrame(false);
                    self._onUpdateFrame(false);
                    break;
                default:
                    self._currentFrame = self._timeline.frames[Math.floor(self._currentTime * self._frameRate)];
                    self._onArriveAtFrame(false);
                    self._onUpdateFrame(false);
                    break;
            }
            self._currentFrame = null;
        };
        p.fadeIn = function (armature, animationState, timelineData, time) {
            var self = this;
            self._armature = armature;
            self._animationState = animationState;
            self._timeline = timelineData;
            var isMainTimeline = this == self._animationState._timeline;
            self._hasAsynchronyTimeline = isMainTimeline || self._animationState.animationData.hasAsynchronyTimeline;
            self._frameRate = self._armature.armatureData.frameRate;
            self._keyFrameCount = self._timeline.frames.length;
            self._frameCount = self._animationState.animationData.frameCount;
            self._position = self._animationState._position;
            self._duration = self._animationState._duration;
            self._animationDutation = self._animationState.animationData.duration;
            self._timeScale = isMainTimeline ? 1 : (1 / self._timeline.scale);
            self._timeOffset = isMainTimeline ? 0 : self._timeline.offset;
            self._onFadeIn();
            self.setCurrentTime(time);
        };
        p.fadeOut = function () { };
        p.update = function (time) {
            var self = this;
            var prevTime = self._currentTime;
            if (!self._isCompleted && self._setCurrentTime(time) && self._keyFrameCount) {
                var currentFrameIndex = self._keyFrameCount > 1 ? Math.floor(self._currentTime * self._frameRate) : 0;
                var currentFrame = self._timeline.frames[currentFrameIndex];
                if (self._currentFrame != currentFrame) {
                    if (self._keyFrameCount > 1) {
                        var crossedFrame = self._currentFrame;
                        self._currentFrame = currentFrame;
                        if (!crossedFrame) {
                            var prevFrameIndex = Math.floor(prevTime * self._frameRate);
                            crossedFrame = self._timeline.frames[prevFrameIndex];
                            if (!self._isReverse && prevTime <= crossedFrame.position) {
                                crossedFrame = crossedFrame.prev;
                            }
                        }
                        if (self._isReverse) {
                            while (crossedFrame != currentFrame) {
                                self._onCrossFrame(crossedFrame);
                                crossedFrame = crossedFrame.prev;
                            }
                        }
                        else {
                            while (crossedFrame != currentFrame) {
                                crossedFrame = crossedFrame.next;
                                self._onCrossFrame(crossedFrame);
                            }
                        }
                        self._onArriveAtFrame(true);
                    }
                    else {
                        self._currentFrame = currentFrame;
                        self._onCrossFrame(self._currentFrame);
                        self._onArriveAtFrame(true);
                    }
                }
                self._onUpdateFrame(true);
            }
        };
        return TimelineState;
    }(dragonBones.BaseObject));
    dragonBones.TimelineState = TimelineState;
    egret.registerClass(TimelineState,'dragonBones.TimelineState');
    /**
     * @private
     */
    var TweenTimelineState = (function (_super) {
        __extends(TweenTimelineState, _super);
        function TweenTimelineState() {
            _super.call(this);
        }
        var d = __define,c=TweenTimelineState,p=c.prototype;
        TweenTimelineState._getEasingValue = function (progress, easing) {
            var value = 1;
            if (easing > 2) {
                return progress;
            }
            else if (easing > 1) {
                value = 0.5 * (1 - Math.cos(progress * Math.PI));
                easing -= 1;
            }
            else if (easing > 0) {
                value = 1 - Math.pow(1 - progress, 2);
            }
            else if (easing >= -1) {
                easing *= -1;
                value = Math.pow(progress, 2);
            }
            else if (easing >= -2) {
                easing *= -1;
                value = Math.acos(1 - progress * 2) / Math.PI;
                easing -= 1;
            }
            else {
                return progress;
            }
            return (value - progress) * easing + progress;
        };
        TweenTimelineState._getCurveEasingValue = function (progress, sampling) {
            var x = 0;
            var y = 0;
            for (var i = 0, l = sampling.length; i < l; i += 2) {
                x = sampling[i];
                y = sampling[i + 1];
                if (x >= progress) {
                    if (i == 0) {
                        return y * progress / x;
                    }
                    else {
                        var xP = sampling[i - 2];
                        var yP = sampling[i - 1]; // i - 2 + 1
                        return yP + (y - yP) * (progress - xP) / (x - xP);
                    }
                }
            }
            return y + (1 - y) * (progress - x) / (1 - x);
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            _super.prototype._onClear.call(this);
            this._tweenProgress = 0;
            this._tweenEasing = dragonBones.DragonBones.NO_TWEEN;
            this._curve = null;
        };
        p._onArriveAtFrame = function (isUpdate) {
            var self = this;
            self._tweenEasing = self._currentFrame.tweenEasing;
            self._curve = self._currentFrame.curve;
            if (self._keyFrameCount == 1 ||
                (self._currentFrame.next == self._timeline.frames[0] &&
                    (self._tweenEasing != dragonBones.DragonBones.NO_TWEEN || self._curve) &&
                    self._animationState.playTimes > 0 &&
                    self._animationState.currentPlayTimes == self._animationState.playTimes - 1)) {
                self._tweenEasing = dragonBones.DragonBones.NO_TWEEN;
                self._curve = null;
            }
        };
        p._onUpdateFrame = function (isUpdate) {
            var self = this;
            if (self._tweenEasing != dragonBones.DragonBones.NO_TWEEN && self._currentFrame.duration > 0) {
                self._tweenProgress = (self._currentTime - self._currentFrame.position + self._position) / self._currentFrame.duration;
                if (self._tweenEasing != 0) {
                    self._tweenProgress = TweenTimelineState._getEasingValue(self._tweenProgress, self._tweenEasing);
                }
            }
            else if (self._curve) {
                self._tweenProgress = (self._currentTime - self._currentFrame.position + self._position) / self._currentFrame.duration;
                self._tweenProgress = TweenTimelineState._getCurveEasingValue(self._tweenProgress, self._curve);
            }
            else {
                self._tweenProgress = 0;
            }
        };
        p._updateExtensionKeyFrame = function (current, next, result) {
            var tweenType = 0 /* None */;
            if (current.type == next.type) {
                for (var i = 0, l = current.tweens.length; i < l; ++i) {
                    var tweenDuration = next.tweens[i] - current.tweens[i];
                    result.tweens[i] = tweenDuration;
                    if (tweenDuration != 0) {
                        tweenType = 2 /* Always */;
                    }
                }
            }
            if (tweenType == 0 /* None */) {
                if (result.type != current.type) {
                    tweenType = 1 /* Once */;
                    result.type = current.type;
                }
                if (result.tweens.length != current.tweens.length) {
                    tweenType = 1 /* Once */;
                    result.tweens.length = current.tweens.length;
                }
                if (result.keys.length != current.keys.length) {
                    tweenType = 1 /* Once */;
                    result.keys.length = current.keys.length;
                }
                for (var i = 0, l = current.keys.length; i < l; ++i) {
                    var key = current.keys[i];
                    if (result.keys[i] != key) {
                        tweenType = 1 /* Once */;
                        result.keys[i] = key;
                    }
                }
            }
            return tweenType;
        };
        return TweenTimelineState;
    }(TimelineState));
    dragonBones.TweenTimelineState = TweenTimelineState;
    egret.registerClass(TweenTimelineState,'dragonBones.TweenTimelineState');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var AnimationTimelineState = (function (_super) {
        __extends(AnimationTimelineState, _super);
        function AnimationTimelineState() {
            _super.call(this);
        }
        var d = __define,c=AnimationTimelineState,p=c.prototype;
        AnimationTimelineState.toString = function () {
            return "[Class dragonBones.AnimationTimelineState]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            _super.prototype._onClear.call(this);
            this._isStarted = false;
        };
        p._onCrossFrame = function (frame) {
            var self = this;
            var actions = frame.actions;
            for (var i = 0, l = actions.length; i < l; ++i) {
                var actionData = actions[i];
                if (actionData.slot) {
                    var slot = self._armature.getSlot(actionData.slot.name);
                    if (slot) {
                        var childArmature = slot.childArmature;
                        if (childArmature) {
                            childArmature._action = actionData;
                        }
                    }
                }
                else if (actionData.bone) {
                    var slots = self._armature.getSlots();
                    for (var i_1 = 0, l_1 = slots.length; i_1 < l_1; ++i_1) {
                        var eachChildArmature = slots[i_1].childArmature;
                        if (eachChildArmature) {
                            eachChildArmature._action = actionData;
                        }
                    }
                }
                else {
                    self._armature._action = actionData;
                }
            }
            var eventDispatcher = self._armature._display;
            var events = frame.events;
            for (var i = 0, l = events.length; i < l; ++i) {
                var eventData = events[i];
                var eventType = "";
                switch (eventData.type) {
                    case 0 /* Frame */:
                        eventType = dragonBones.EventObject.FRAME_EVENT;
                        break;
                    case 1 /* Sound */:
                        eventType = dragonBones.EventObject.SOUND_EVENT;
                        break;
                }
                if (eventDispatcher.hasEvent(eventType)) {
                    var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                    eventObject.animationState = self._animationState;
                    if (eventData.bone) {
                        eventObject.bone = self._armature.getBone(eventData.bone.name);
                    }
                    if (eventData.slot) {
                        eventObject.slot = self._armature.getSlot(eventData.slot.name);
                    }
                    eventObject.name = eventData.name;
                    eventObject.data = eventData.data;
                    self._armature._bufferEvent(eventObject, eventType);
                }
            }
        };
        p.update = function (time) {
            var self = this;
            var prevPlayTimes = self._currentPlayTimes;
            var eventDispatcher = self._armature._display;
            if (!self._isStarted && time != 0) {
                self._isStarted = true;
                if (eventDispatcher.hasEvent(dragonBones.EventObject.START)) {
                    var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                    eventObject.animationState = self._animationState;
                    self._armature._bufferEvent(eventObject, dragonBones.EventObject.START);
                }
            }
            _super.prototype.update.call(this, time);
            if (prevPlayTimes != self._currentPlayTimes) {
                var eventType = self._isCompleted ? dragonBones.EventObject.COMPLETE : dragonBones.EventObject.LOOP_COMPLETE;
                if (eventDispatcher.hasEvent(eventType)) {
                    var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                    eventObject.animationState = self._animationState;
                    self._armature._bufferEvent(eventObject, eventType);
                }
            }
        };
        return AnimationTimelineState;
    }(dragonBones.TimelineState));
    dragonBones.AnimationTimelineState = AnimationTimelineState;
    egret.registerClass(AnimationTimelineState,'dragonBones.AnimationTimelineState');
    /**
     * @private
     */
    var BoneTimelineState = (function (_super) {
        __extends(BoneTimelineState, _super);
        function BoneTimelineState() {
            _super.call(this);
            this._transform = new dragonBones.Transform();
            this._currentTransform = new dragonBones.Transform();
            this._durationTransform = new dragonBones.Transform();
        }
        var d = __define,c=BoneTimelineState,p=c.prototype;
        BoneTimelineState.toString = function () {
            return "[Class dragonBones.BoneTimelineState]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.bone = null;
            self._tweenTransform = 0 /* None */;
            self._tweenRotate = 0 /* None */;
            self._tweenScale = 0 /* None */;
            self._boneTransform = null;
            self._originTransform = null;
            self._transform.identity();
            self._currentTransform.identity();
            self._durationTransform.identity();
        };
        p._onFadeIn = function () {
            var self = this;
            self._originTransform = self._timeline.originTransform;
            self._boneTransform = self.bone._animationPose;
        };
        p._onArriveAtFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onArriveAtFrame.call(this, isUpdate);
            self._currentTransform.copyFrom(self._currentFrame.transform);
            self._tweenTransform = 1 /* Once */;
            self._tweenRotate = 1 /* Once */;
            self._tweenScale = 1 /* Once */;
            if (self._keyFrameCount > 1 && (self._tweenEasing != dragonBones.DragonBones.NO_TWEEN || self._curve)) {
                var nextFrame = self._currentFrame.next;
                var nextTransform = nextFrame.transform;
                // Transform.
                self._durationTransform.x = nextTransform.x - self._currentTransform.x;
                self._durationTransform.y = nextTransform.y - self._currentTransform.y;
                if (self._durationTransform.x != 0 || self._durationTransform.y != 0) {
                    self._tweenTransform = 2 /* Always */;
                }
                // Rotate.
                var tweenRotate = self._currentFrame.tweenRotate;
                if (tweenRotate == tweenRotate) {
                    if (tweenRotate) {
                        if (tweenRotate > 0 ? nextTransform.skewY >= self._currentTransform.skewY : nextTransform.skewY <= self._currentTransform.skewY) {
                            var rotate = tweenRotate > 0 ? tweenRotate - 1 : tweenRotate + 1;
                            self._durationTransform.skewX = nextTransform.skewX - self._currentTransform.skewX + dragonBones.DragonBones.PI_D * rotate;
                            self._durationTransform.skewY = nextTransform.skewY - self._currentTransform.skewY + dragonBones.DragonBones.PI_D * rotate;
                        }
                        else {
                            self._durationTransform.skewX = nextTransform.skewX - self._currentTransform.skewX + dragonBones.DragonBones.PI_D * tweenRotate;
                            self._durationTransform.skewY = nextTransform.skewY - self._currentTransform.skewY + dragonBones.DragonBones.PI_D * tweenRotate;
                        }
                    }
                    else {
                        self._durationTransform.skewX = dragonBones.Transform.normalizeRadian(nextTransform.skewX - self._currentTransform.skewX);
                        self._durationTransform.skewY = dragonBones.Transform.normalizeRadian(nextTransform.skewY - self._currentTransform.skewY);
                    }
                    if (self._durationTransform.skewX != 0 || self._durationTransform.skewY != 0) {
                        self._tweenRotate = 2 /* Always */;
                    }
                }
                else {
                    self._durationTransform.skewX = 0;
                    self._durationTransform.skewY = 0;
                }
                // Scale.
                if (self._currentFrame.tweenScale) {
                    self._durationTransform.scaleX = nextTransform.scaleX - self._currentTransform.scaleX;
                    self._durationTransform.scaleY = nextTransform.scaleY - self._currentTransform.scaleY;
                    if (self._durationTransform.scaleX != 0 || self._durationTransform.scaleY != 0) {
                        self._tweenScale = 2 /* Always */;
                    }
                }
                else {
                    self._durationTransform.scaleX = 0;
                    self._durationTransform.scaleY = 0;
                }
            }
            else {
                self._durationTransform.x = 0;
                self._durationTransform.y = 0;
                self._durationTransform.skewX = 0;
                self._durationTransform.skewY = 0;
                self._durationTransform.scaleX = 0;
                self._durationTransform.scaleY = 0;
            }
        };
        p._onUpdateFrame = function (isUpdate) {
            var self = this;
            if (self._tweenTransform || self._tweenRotate || self._tweenScale) {
                _super.prototype._onUpdateFrame.call(this, isUpdate);
                if (self._tweenTransform) {
                    if (self._tweenTransform == 1 /* Once */) {
                        self._tweenTransform = 0 /* None */;
                    }
                    if (self._animationState.additiveBlending) {
                        self._transform.x = self._currentTransform.x + self._durationTransform.x * self._tweenProgress;
                        self._transform.y = self._currentTransform.y + self._durationTransform.y * self._tweenProgress;
                    }
                    else {
                        self._transform.x = self._originTransform.x + self._currentTransform.x + self._durationTransform.x * self._tweenProgress;
                        self._transform.y = self._originTransform.y + self._currentTransform.y + self._durationTransform.y * self._tweenProgress;
                    }
                }
                if (self._tweenRotate) {
                    if (self._tweenRotate == 1 /* Once */) {
                        self._tweenRotate = 0 /* None */;
                    }
                    if (self._animationState.additiveBlending) {
                        self._transform.skewX = self._currentTransform.skewX + self._durationTransform.skewX * self._tweenProgress;
                        self._transform.skewY = self._currentTransform.skewY + self._durationTransform.skewY * self._tweenProgress;
                    }
                    else {
                        self._transform.skewX = self._originTransform.skewX + self._currentTransform.skewX + self._durationTransform.skewX * self._tweenProgress;
                        self._transform.skewY = self._originTransform.skewY + self._currentTransform.skewY + self._durationTransform.skewY * self._tweenProgress;
                    }
                }
                if (self._tweenScale) {
                    if (self._tweenScale == 1 /* Once */) {
                        self._tweenScale = 0 /* None */;
                    }
                    if (self._animationState.additiveBlending) {
                        self._transform.scaleX = self._currentTransform.scaleX + self._durationTransform.scaleX * self._tweenProgress;
                        self._transform.scaleY = self._currentTransform.scaleY + self._durationTransform.scaleY * self._tweenProgress;
                    }
                    else {
                        self._transform.scaleX = self._originTransform.scaleX * (self._currentTransform.scaleX + self._durationTransform.scaleX * self._tweenProgress);
                        self._transform.scaleY = self._originTransform.scaleY * (self._currentTransform.scaleY + self._durationTransform.scaleY * self._tweenProgress);
                    }
                }
                self.bone.invalidUpdate();
            }
        };
        p.fadeOut = function () {
            var self = this;
            self._transform.skewX = dragonBones.Transform.normalizeRadian(self._transform.skewX);
            self._transform.skewY = dragonBones.Transform.normalizeRadian(self._transform.skewY);
        };
        p.update = function (time) {
            var self = this;
            _super.prototype.update.call(this, time);
            // Blend animation state.
            var weight = self._animationState._weightResult;
            if (weight > 0) {
                if (self.bone._blendIndex == 0) {
                    self._boneTransform.x = self._transform.x * weight;
                    self._boneTransform.y = self._transform.y * weight;
                    self._boneTransform.skewX = self._transform.skewX * weight;
                    self._boneTransform.skewY = self._transform.skewY * weight;
                    self._boneTransform.scaleX = (self._transform.scaleX - 1) * weight + 1;
                    self._boneTransform.scaleY = (self._transform.scaleY - 1) * weight + 1;
                }
                else {
                    self._boneTransform.x += self._transform.x * weight;
                    self._boneTransform.y += self._transform.y * weight;
                    self._boneTransform.skewX += self._transform.skewX * weight;
                    self._boneTransform.skewY += self._transform.skewY * weight;
                    self._boneTransform.scaleX += (self._transform.scaleX - 1) * weight;
                    self._boneTransform.scaleY += (self._transform.scaleY - 1) * weight;
                }
                self.bone._blendIndex++;
                var fadeProgress = self._animationState._fadeProgress;
                if (fadeProgress < 1) {
                    self.bone.invalidUpdate();
                }
            }
        };
        return BoneTimelineState;
    }(dragonBones.TweenTimelineState));
    dragonBones.BoneTimelineState = BoneTimelineState;
    egret.registerClass(BoneTimelineState,'dragonBones.BoneTimelineState');
    /**
     * @private
     */
    var SlotTimelineState = (function (_super) {
        __extends(SlotTimelineState, _super);
        function SlotTimelineState() {
            _super.call(this);
            this._color = new dragonBones.ColorTransform();
            this._durationColor = new dragonBones.ColorTransform();
        }
        var d = __define,c=SlotTimelineState,p=c.prototype;
        SlotTimelineState.toString = function () {
            return "[Class dragonBones.SlotTimelineState]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.slot = null;
            self._colorDirty = false;
            self._tweenColor = 0 /* None */;
            self._slotColor = null;
            self._color.identity();
            self._durationColor.identity();
        };
        p._onFadeIn = function () {
            this._slotColor = this.slot._colorTransform;
        };
        p._onArriveAtFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onArriveAtFrame.call(this, isUpdate);
            if (self._animationState._isDisabled(self.slot)) {
                self._tweenEasing = dragonBones.DragonBones.NO_TWEEN;
                self._curve = null;
                self._tweenColor = 0 /* None */;
                return;
            }
            if (self.slot._displayDataSet) {
                var displayIndex = self._currentFrame.displayIndex;
                if (self.slot.displayIndex >= 0 && displayIndex >= 0) {
                    if (self.slot._displayDataSet.displays.length > 1) {
                        self.slot._setDisplayIndex(displayIndex);
                    }
                }
                else {
                    self.slot._setDisplayIndex(displayIndex);
                }
                self.slot._updateMeshData(true);
            }
            if (self._currentFrame.displayIndex >= 0) {
                self._tweenColor = 0 /* None */;
                var currentColor = self._currentFrame.color;
                if (self._keyFrameCount > 1 && (self._tweenEasing != dragonBones.DragonBones.NO_TWEEN || self._curve)) {
                    var nextFrame = self._currentFrame.next;
                    var nextColor = nextFrame.color;
                    if (currentColor != nextColor && nextFrame.displayIndex >= 0) {
                        self._durationColor.alphaMultiplier = nextColor.alphaMultiplier - currentColor.alphaMultiplier;
                        self._durationColor.redMultiplier = nextColor.redMultiplier - currentColor.redMultiplier;
                        self._durationColor.greenMultiplier = nextColor.greenMultiplier - currentColor.greenMultiplier;
                        self._durationColor.blueMultiplier = nextColor.blueMultiplier - currentColor.blueMultiplier;
                        self._durationColor.alphaOffset = nextColor.alphaOffset - currentColor.alphaOffset;
                        self._durationColor.redOffset = nextColor.redOffset - currentColor.redOffset;
                        self._durationColor.greenOffset = nextColor.greenOffset - currentColor.greenOffset;
                        self._durationColor.blueOffset = nextColor.blueOffset - currentColor.blueOffset;
                        if (self._durationColor.alphaMultiplier != 0 ||
                            self._durationColor.redMultiplier != 0 ||
                            self._durationColor.greenMultiplier != 0 ||
                            self._durationColor.blueMultiplier != 0 ||
                            self._durationColor.alphaOffset != 0 ||
                            self._durationColor.redOffset != 0 ||
                            self._durationColor.greenOffset != 0 ||
                            self._durationColor.blueOffset != 0) {
                            self._tweenColor = 2 /* Always */;
                        }
                    }
                }
                if (self._tweenColor == 0 /* None */) {
                    self._durationColor.alphaMultiplier = currentColor.alphaMultiplier - self._slotColor.alphaMultiplier;
                    self._durationColor.redMultiplier = currentColor.redMultiplier - self._slotColor.redMultiplier;
                    self._durationColor.greenMultiplier = currentColor.greenMultiplier - self._slotColor.greenMultiplier;
                    self._durationColor.blueMultiplier = currentColor.blueMultiplier - self._slotColor.blueMultiplier;
                    self._durationColor.alphaOffset = currentColor.alphaOffset - self._slotColor.alphaOffset;
                    self._durationColor.redOffset = currentColor.redOffset - self._slotColor.redOffset;
                    self._durationColor.greenOffset = currentColor.greenOffset - self._slotColor.greenOffset;
                    self._durationColor.blueOffset = currentColor.blueOffset - self._slotColor.blueOffset;
                    if (self._durationColor.alphaMultiplier != 0 ||
                        self._durationColor.redMultiplier != 0 ||
                        self._durationColor.greenMultiplier != 0 ||
                        self._durationColor.blueMultiplier != 0 ||
                        self._durationColor.alphaOffset != 0 ||
                        self._durationColor.redOffset != 0 ||
                        self._durationColor.greenOffset != 0 ||
                        self._durationColor.blueOffset != 0) {
                        self._tweenColor = 1 /* Once */;
                    }
                }
            }
            else {
                self._tweenEasing = dragonBones.DragonBones.NO_TWEEN;
                self._curve = null;
                self._tweenColor = 0 /* None */;
            }
        };
        p._onUpdateFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onUpdateFrame.call(this, isUpdate);
            if (self._tweenColor) {
                if (self._tweenColor == 1 /* Once */) {
                    self._tweenColor = 0 /* None */;
                }
                var currentColor = self._currentFrame.color;
                self._color.alphaMultiplier = currentColor.alphaMultiplier + self._durationColor.alphaMultiplier * self._tweenProgress;
                self._color.redMultiplier = currentColor.redMultiplier + self._durationColor.redMultiplier * self._tweenProgress;
                self._color.greenMultiplier = currentColor.greenMultiplier + self._durationColor.greenMultiplier * self._tweenProgress;
                self._color.blueMultiplier = currentColor.blueMultiplier + self._durationColor.blueMultiplier * self._tweenProgress;
                self._color.alphaOffset = currentColor.alphaOffset + self._durationColor.alphaOffset * self._tweenProgress;
                self._color.redOffset = currentColor.redOffset + self._durationColor.redOffset * self._tweenProgress;
                self._color.greenOffset = currentColor.greenOffset + self._durationColor.greenOffset * self._tweenProgress;
                self._color.blueOffset = currentColor.blueOffset + self._durationColor.blueOffset * self._tweenProgress;
                self._colorDirty = true;
            }
        };
        p.fadeOut = function () {
            this._tweenColor = 0 /* None */;
        };
        p.update = function (time) {
            var self = this;
            _super.prototype.update.call(this, time);
            // Fade animation.
            if (self._tweenColor != 0 /* None */ || self._colorDirty) {
                var weight = self._animationState._weightResult;
                if (weight > 0) {
                    var fadeProgress = self._animationState._fadeProgress;
                    if (fadeProgress < 1) {
                        self._slotColor.alphaMultiplier += (self._color.alphaMultiplier - self._slotColor.alphaMultiplier) * fadeProgress;
                        self._slotColor.redMultiplier += (self._color.redMultiplier - self._slotColor.redMultiplier) * fadeProgress;
                        self._slotColor.greenMultiplier += (self._color.greenMultiplier - self._slotColor.greenMultiplier) * fadeProgress;
                        self._slotColor.blueMultiplier += (self._color.blueMultiplier - self._slotColor.blueMultiplier) * fadeProgress;
                        self._slotColor.alphaOffset += (self._color.alphaOffset - self._slotColor.alphaOffset) * fadeProgress;
                        self._slotColor.redOffset += (self._color.redOffset - self._slotColor.redOffset) * fadeProgress;
                        self._slotColor.greenOffset += (self._color.greenOffset - self._slotColor.greenOffset) * fadeProgress;
                        self._slotColor.blueOffset += (self._color.blueOffset - self._slotColor.blueOffset) * fadeProgress;
                        self.slot._colorDirty = true;
                    }
                    else if (self._colorDirty) {
                        self._colorDirty = false;
                        self._slotColor.alphaMultiplier = self._color.alphaMultiplier;
                        self._slotColor.redMultiplier = self._color.redMultiplier;
                        self._slotColor.greenMultiplier = self._color.greenMultiplier;
                        self._slotColor.blueMultiplier = self._color.blueMultiplier;
                        self._slotColor.alphaOffset = self._color.alphaOffset;
                        self._slotColor.redOffset = self._color.redOffset;
                        self._slotColor.greenOffset = self._color.greenOffset;
                        self._slotColor.blueOffset = self._color.blueOffset;
                        self.slot._colorDirty = true;
                    }
                }
            }
        };
        return SlotTimelineState;
    }(dragonBones.TweenTimelineState));
    dragonBones.SlotTimelineState = SlotTimelineState;
    egret.registerClass(SlotTimelineState,'dragonBones.SlotTimelineState');
    /**
     * @private
     */
    var FFDTimelineState = (function (_super) {
        __extends(FFDTimelineState, _super);
        function FFDTimelineState() {
            _super.call(this);
            this._ffdVertices = [];
        }
        var d = __define,c=FFDTimelineState,p=c.prototype;
        FFDTimelineState.toString = function () {
            return "[Class dragonBones.FFDTimelineState]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.slot = null;
            self._tweenFFD = 0 /* None */;
            self._slotFFDVertices = null;
            if (self._durationFFDFrame) {
                self._durationFFDFrame.returnToPool();
                self._durationFFDFrame = null;
            }
            if (self._ffdVertices.length) {
                self._ffdVertices.length = 0;
            }
        };
        p._onFadeIn = function () {
            var self = this;
            self._slotFFDVertices = self.slot._ffdVertices;
            self._durationFFDFrame = dragonBones.BaseObject.borrowObject(dragonBones.ExtensionFrameData);
            self._durationFFDFrame.tweens.length = self._slotFFDVertices.length;
            self._ffdVertices.length = self._slotFFDVertices.length;
            for (var i = 0, l = self._durationFFDFrame.tweens.length; i < l; ++i) {
                self._durationFFDFrame.tweens[i] = 0;
            }
            for (var i = 0, l = self._ffdVertices.length; i < l; ++i) {
                self._ffdVertices[i] = 0;
            }
        };
        p._onArriveAtFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onArriveAtFrame.call(this, isUpdate);
            self._tweenFFD = 0 /* None */;
            if (self._tweenEasing != dragonBones.DragonBones.NO_TWEEN || self._curve) {
                self._tweenFFD = self._updateExtensionKeyFrame(self._currentFrame, self._currentFrame.next, self._durationFFDFrame);
            }
            if (self._tweenFFD == 0 /* None */) {
                var currentFFDVertices = self._currentFrame.tweens;
                for (var i = 0, l = currentFFDVertices.length; i < l; ++i) {
                    if (self._slotFFDVertices[i] != currentFFDVertices[i]) {
                        self._tweenFFD = 1 /* Once */;
                        break;
                    }
                }
            }
        };
        p._onUpdateFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onUpdateFrame.call(this, isUpdate);
            if (self._tweenFFD != 0 /* None */) {
                if (self._tweenFFD == 1 /* Once */) {
                    self._tweenFFD = 0 /* None */;
                }
                var currentFFDVertices = self._currentFrame.tweens;
                var nextFFDVertices = self._durationFFDFrame.tweens;
                for (var i = 0, l = currentFFDVertices.length; i < l; ++i) {
                    self._ffdVertices[i] = currentFFDVertices[i] + nextFFDVertices[i] * self._tweenProgress;
                }
                self.slot._ffdDirty = true;
            }
        };
        p.update = function (time) {
            var self = this;
            _super.prototype.update.call(this, time);
            // Blend animation.
            var weight = self._animationState._weightResult;
            if (weight > 0) {
                if (self.slot._blendIndex == 0) {
                    for (var i = 0, l = self._ffdVertices.length; i < l; ++i) {
                        self._slotFFDVertices[i] = self._ffdVertices[i] * weight;
                    }
                }
                else {
                    for (var i = 0, l = self._ffdVertices.length; i < l; ++i) {
                        self._slotFFDVertices[i] += self._ffdVertices[i] * weight;
                    }
                }
                self.slot._blendIndex++;
                var fadeProgress = self._animationState._fadeProgress;
                if (fadeProgress < 1) {
                    self.slot._ffdDirty = true;
                }
            }
        };
        return FFDTimelineState;
    }(dragonBones.TweenTimelineState));
    dragonBones.FFDTimelineState = FFDTimelineState;
    egret.registerClass(FFDTimelineState,'dragonBones.FFDTimelineState');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * WorldClock 提供时钟的支持，为每个加入到时钟的 IAnimatable 对象更新时间。
     * @see dragonBones.IAnimatable
     * @see dragonBones.Armature
     * @version DragonBones 3.0
     */
    var WorldClock = (function () {
        /**
         * @language zh_CN
         * 创建一个新的 WorldClock 实例。
         * 通常并不需要单独创建 WorldClock 的实例，可以直接使用 WorldClock.clock 静态实例。
         * (创建更多独立的 WorldClock 可以更灵活的为需要更新的 IAnimateble 实例分组，实现不同组不同速度的动画播放)
         * @version DragonBones 3.0
         */
        function WorldClock() {
            /**
             * @language zh_CN
             * 当前的时间。 (以秒为单位)
             * @version DragonBones 3.0
             */
            this.time = new Date().getTime() / dragonBones.DragonBones.SECOND_TO_MILLISECOND;
            /**
             * @language zh_CN
             * 时间流逝的速度，用于实现动画的变速播放。 [0: 停止播放, (0~1): 慢速播放, 1: 正常播放, (1~N): 快速播放]
             * @default 1
             * @version DragonBones 3.0
             */
            this.timeScale = 1;
            this._animatebles = [];
        }
        var d = __define,c=WorldClock,p=c.prototype;
        d(WorldClock, "clock"
            /**
             * @language zh_CN
             * 一个可以直接使用的全局静态 WorldClock 实例.
             * @version DragonBones 3.0
             */
            ,function () {
                if (!WorldClock._clock) {
                    WorldClock._clock = new WorldClock();
                }
                return WorldClock._clock;
            }
        );
        /**
         * @language zh_CN
         * 为所有的 IAnimatable 实例向前播放一个指定的时间。 (通常这个方法需要在 ENTER_FRAME 事件的响应函数中被调用)
         * @param passedTime 前进的时间。 (以秒为单位，当设置为 -1 时将自动计算当前帧与上一帧的时间差)
         * @version DragonBones 3.0
         */
        p.advanceTime = function (passedTime) {
            var self = this;
            if (passedTime != passedTime) {
                passedTime = 0;
            }
            if (passedTime < 0) {
                passedTime = new Date().getTime() / dragonBones.DragonBones.SECOND_TO_MILLISECOND - self.time;
            }
            passedTime *= self.timeScale;
            if (passedTime < 0) {
                self.time -= passedTime;
            }
            else {
                self.time += passedTime;
            }
            if (passedTime) {
                var i = 0, r = 0, l = self._animatebles.length;
                for (; i < l; ++i) {
                    var animateble = self._animatebles[i];
                    if (animateble) {
                        animateble.advanceTime(passedTime);
                    }
                    else {
                        r++;
                    }
                }
                if (r > 0) {
                    r = 0;
                    l = self._animatebles.length;
                    for (; i < l; ++i) {
                        var animateble = self._animatebles[i];
                        if (animateble) {
                            self._animatebles[i - r] = animateble;
                        }
                        else {
                            r++;
                        }
                    }
                    self._animatebles.length -= r;
                }
            }
        };
        /**
         * 是否包含指定的 IAnimatable 实例
         * @param value 指定的 IAnimatable 实例。
         * @returns  [true: 包含，false: 不包含]。
         * @version DragonBones 3.0
         */
        p.contains = function (value) {
            return this._animatebles.indexOf(value) >= 0;
        };
        /**
         * @language zh_CN
         * 添加指定的 IAnimatable 实例。
         * @param value IAnimatable 实例。
         * @version DragonBones 3.0
         */
        p.add = function (value) {
            if (value && this._animatebles.indexOf(value) < 0) {
                this._animatebles.push(value);
                if (dragonBones.DragonBones.DEBUG && value instanceof dragonBones.Armature) {
                    dragonBones.DragonBones.addArmature(value);
                }
            }
        };
        /**
         * @language zh_CN
         * 移除指定的 IAnimatable 实例。
         * @param value IAnimatable 实例。
         * @version DragonBones 3.0
         */
        p.remove = function (value) {
            var index = this._animatebles.indexOf(value);
            if (index >= 0) {
                this._animatebles[index] = null;
                if (dragonBones.DragonBones.DEBUG && value instanceof dragonBones.Armature) {
                    dragonBones.DragonBones.removeArmature(value);
                }
            }
        };
        /**
         * @language zh_CN
         * 清除所有的 IAnimatable 实例。
         * @version DragonBones 3.0
         */
        p.clear = function () {
            for (var i = 0, l = this._animatebles.length; i < l; ++i) {
                this._animatebles[i] = null;
            }
        };
        WorldClock._clock = null;
        return WorldClock;
    }());
    dragonBones.WorldClock = WorldClock;
    egret.registerClass(WorldClock,'dragonBones.WorldClock',["dragonBones.IAnimateble"]);
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 骨架，是骨骼动画系统的核心，由显示容器、骨骼、插槽、动画、事件系统构成。
     * @see dragonBones.ArmatureData
     * @see dragonBones.Bone
     * @see dragonBones.Slot
     * @see dragonBones.Animation
     * @see dragonBones.IArmatureDisplayContainer
     * @version DragonBones 3.0
     */
    var Armature = (function (_super) {
        __extends(Armature, _super);
        /**
         * @private
         */
        function Armature() {
            _super.call(this);
            /**
             * @private Store bones based on bones' hierarchy (From root to leaf)
             */
            this._bones = [];
            /**
             * @private Store slots based on slots' zOrder (From low to high)
             */
            this._slots = [];
            /**
             * @private
             */
            this._events = [];
            /**
             * @deprecated
             * @see #cacheFrameRate
             */
            this.enableCache = false;
        }
        var d = __define,c=Armature,p=c.prototype;
        /**
         * @private
         */
        Armature.toString = function () {
            return "[Class dragonBones.Armature]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.userData = null;
            self._bonesDirty = false;
            self._cacheFrameIndex = -1;
            self._armatureData = null;
            self._skinData = null;
            if (self._animation) {
                self._animation.returnToPool();
                self._animation = null;
            }
            if (self._display) {
                self._display._onClear();
                self._display = null;
            }
            self._parent = null;
            self._action = null;
            self._replacedTexture = null;
            self._delayDispose = false;
            self._lockDispose = false;
            self._slotsDirty = false;
            if (self._bones.length) {
                for (var i = 0, l = self._bones.length; i < l; ++i) {
                    self._bones[i].returnToPool();
                }
                self._bones.length = 0;
            }
            if (self._slots.length) {
                for (var i = 0, l = self._slots.length; i < l; ++i) {
                    self._slots[i].returnToPool();
                }
                self._slots.length = 0;
            }
            if (self._events.length) {
                for (var i = 0, l = self._events.length; i < l; ++i) {
                    self._events[i].returnToPool();
                }
                self._events.length = 0;
            }
        };
        /**
         * @private
         */
        p._sortBones = function () {
            var total = this._bones.length;
            if (!total) {
                return;
            }
            var sortHelper = this._bones.concat();
            var index = 0;
            var count = 0;
            this._bones.length = 0;
            while (count < total) {
                var bone = sortHelper[index++];
                if (index >= total) {
                    index = 0;
                }
                if (this._bones.indexOf(bone) >= 0) {
                    continue;
                }
                if (bone.parent && this._bones.indexOf(bone.parent) < 0) {
                    continue;
                }
                if (bone.ik && this._bones.indexOf(bone.ik) < 0) {
                    continue;
                }
                if (bone.ik && bone.ikChain > 0 && bone.ikChainIndex == bone.ikChain) {
                    this._bones.splice(this._bones.indexOf(bone.parent) + 1, 0, bone); // ik, parent, bone, children
                }
                else {
                    this._bones.push(bone);
                }
                count++;
            }
        };
        /**
         * @private
         */
        p._sortSlots = function () {
        };
        /**
         * @private
         */
        p._addBoneToBoneList = function (value) {
            if (this._bones.indexOf(value) < 0) {
                this._bonesDirty = true;
                this._bones[this._bones.length] = value;
                this._animation._timelineStateDirty = true;
            }
        };
        /**
         * @private
         */
        p._removeBoneFromBoneList = function (value) {
            var index = this._bones.indexOf(value);
            if (index >= 0) {
                this._bones.splice(index, 1);
                this._animation._timelineStateDirty = true;
            }
        };
        /**
         * @private
         */
        p._addSlotToSlotList = function (value) {
            if (this._slots.indexOf(value) < 0) {
                this._slotsDirty = true;
                this._slots[this._slots.length] = value;
                this._animation._timelineStateDirty = true;
            }
        };
        /**
         * @private
         */
        p._removeSlotFromSlotList = function (value) {
            var index = this._slots.indexOf(value);
            if (index >= 0) {
                this._slots.splice(index, 1);
                this._animation._timelineStateDirty = true;
            }
        };
        /**
         * @private
         */
        p._bufferEvent = function (value, type) {
            value.type = type;
            value.armature = this;
            this._events.push(value);
        };
        /**
         * @language zh_CN
         * 释放骨架。 (会回收到内存池)
         * @version DragonBones 3.0
         */
        p.dispose = function () {
            this._delayDispose = true;
            if (!this._lockDispose) {
                this.returnToPool();
            }
        };
        /**
         * @language zh_CN
         * 更新骨架和动画。 (可以使用时钟实例或显示容器来更新)
         * @param passedTime 两帧之前的时间间隔。 (以秒为单位)
         * @see dragonBones.IAnimateble
         * @see dragonBones.WorldClock
         * @see dragonBones.IArmatureDisplay
         * @version DragonBones 3.0
         */
        p.advanceTime = function (passedTime) {
            var self = this;
            if (!self._lockDispose) {
                self._lockDispose = true;
                var scaledPassedTime = passedTime * self._animation.timeScale;
                // Animations.
                self._animation._advanceTime(scaledPassedTime);
                // Bones and slots.
                if (self._bonesDirty) {
                    self._bonesDirty = false;
                    self._sortBones();
                }
                if (self._slotsDirty) {
                    self._slotsDirty = false;
                    self._sortSlots();
                }
                for (var i = 0, l = self._bones.length; i < l; ++i) {
                    self._bones[i]._update(self._cacheFrameIndex);
                }
                for (var i = 0, l = self._slots.length; i < l; ++i) {
                    var slot = self._slots[i];
                    slot._update(self._cacheFrameIndex);
                    var childArmature = slot.childArmature;
                    if (childArmature) {
                        if (slot.inheritAnimation) {
                            childArmature.advanceTime(scaledPassedTime);
                        }
                        else {
                            childArmature.advanceTime(passedTime);
                        }
                    }
                }
                // Actions and events.
                if (self._action) {
                    switch (self._action.type) {
                        case 0 /* Play */:
                            self._animation.play(self._action.data[0], self._action.data[1]);
                            break;
                        case 1 /* Stop */:
                            self._animation.stop(self._action.data[0]);
                            break;
                        case 2 /* GotoAndPlay */:
                            self._animation.gotoAndPlayByTime(self._action.data[0], self._action.data[1], self._action.data[2]);
                            break;
                        case 3 /* GotoAndStop */:
                            self._animation.gotoAndStopByTime(self._action.data[0], self._action.data[1]);
                            break;
                        case 4 /* FadeIn */:
                            self._animation.fadeIn(self._action.data[0], self._action.data[1], self._action.data[2]);
                            break;
                        case 5 /* FadeOut */:
                            // TODO fade out
                            break;
                    }
                    self._action = null;
                }
                if (self._events.length > 0) {
                    for (var i = 0, l = self._events.length; i < l; ++i) {
                        var event_5 = self._events[i];
                        if (Armature._soundEventManager && event_5.type == dragonBones.EventObject.SOUND_EVENT) {
                            Armature._soundEventManager._dispatchEvent(event_5);
                        }
                        else {
                            self._display._dispatchEvent(event_5);
                        }
                        event_5.returnToPool();
                    }
                    self._events.length = 0;
                }
                self._lockDispose = false;
            }
            if (self._delayDispose) {
                self.returnToPool();
            }
        };
        /**
         * @language zh_CN
         * 更新骨骼和插槽的变换。 (当骨骼没有动画状态或动画状态播放完成时，骨骼将不在更新)
         * @param boneName 指定的骨骼名称，如果未设置，将更新所有骨骼。
         * @param updateSlotDisplay 是否更新插槽的显示对象。
         * @see dragonBones.Bone
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         */
        p.invalidUpdate = function (boneName, updateSlotDisplay) {
            if (boneName === void 0) { boneName = null; }
            if (updateSlotDisplay === void 0) { updateSlotDisplay = false; }
            if (boneName) {
                var bone = this.getBone(boneName);
                if (bone) {
                    bone.invalidUpdate();
                    if (updateSlotDisplay) {
                        for (var i = 0, l = this._slots.length; i < l; ++i) {
                            var slot = this._slots[i];
                            if (slot.parent == bone) {
                                slot.invalidUpdate();
                            }
                        }
                    }
                }
            }
            else {
                for (var i = 0, l = this._bones.length; i < l; ++i) {
                    this._bones[i].invalidUpdate();
                }
                if (updateSlotDisplay) {
                    for (var i = 0, l = this._slots.length; i < l; ++i) {
                        this._slots[i].invalidUpdate();
                    }
                }
            }
        };
        /**
         * @language zh_CN
         * 获取指定名称的插槽。
         * @param name 插槽的名称。
         * @returns 插槽。
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         */
        p.getSlot = function (name) {
            for (var i = 0, l = this._slots.length; i < l; ++i) {
                var slot = this._slots[i];
                if (slot.name == name) {
                    return slot;
                }
            }
            return null;
        };
        /**
         * @language zh_CN
         * 通过显示对象获取插槽。
         * @param display 显示对象。
         * @returns 包含这个显示对象的插槽。
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         */
        p.getSlotByDisplay = function (display) {
            if (display) {
                for (var i = 0, l = this._slots.length; i < l; ++i) {
                    var slot = this._slots[i];
                    if (slot.display == display) {
                        return slot;
                    }
                }
            }
            return null;
        };
        /**
         * @language zh_CN
         * 将一个指定的插槽添加到骨架中。
         * @param value 需要添加的插槽。
         * @param parentName 需要添加到的父骨骼名称。
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         */
        p.addSlot = function (value, parentName) {
            var bone = this.getBone(parentName);
            if (bone) {
                value._setArmature(this);
                value._setParent(bone);
            }
            else {
                throw new Error();
            }
        };
        /**
         * @language zh_CN
         * 将一个指定的插槽从骨架中移除。
         * @param value 需要移除的插槽
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         */
        p.removeSlot = function (value) {
            if (value && value.armature == this) {
                value._setParent(null);
                value._setArmature(null);
            }
            else {
                throw new Error();
            }
        };
        /**
         * @language zh_CN
         * 获取指定名称的骨骼。
         * @param name 骨骼的名称。
         * @returns 骨骼。
         * @see dragonBones.Bone
         * @version DragonBones 3.0
         */
        p.getBone = function (name) {
            for (var i = 0, l = this._bones.length; i < l; ++i) {
                var bone = this._bones[i];
                if (bone.name == name) {
                    return bone;
                }
            }
            return null;
        };
        /**
         * @language zh_CN
         * 通过显示对象获取骨骼。
         * @param display 显示对象。
         * @returns 包含这个显示对象的骨骼。
         * @see dragonBones.Bone
         * @version DragonBones 3.0
         */
        p.getBoneByDisplay = function (display) {
            var slot = this.getSlotByDisplay(display);
            return slot ? slot.parent : null;
        };
        /**
         * @language zh_CN
         * 将一个指定的骨骼添加到骨架中。
         * @param value 需要添加的骨骼。
         * @param parentName 需要添加到父骨骼的名称，如果未设置，则添加到骨架根部。
         * @see dragonBones.Bone
         * @version DragonBones 3.0
         */
        p.addBone = function (value, parentName) {
            if (parentName === void 0) { parentName = null; }
            if (value) {
                value._setArmature(this);
                value._setParent(parentName ? this.getBone(parentName) : null);
            }
            else {
                throw new Error();
            }
        };
        /**
         * @language zh_CN
         * 将一个指定的骨骼从骨架中移除。
         * @param value 需要移除的骨骼。
         * @see dragonBones.Bone
         * @version DragonBones 3.0
         */
        p.removeBone = function (value) {
            if (value && value.armature == this) {
                value._setParent(null);
                value._setArmature(null);
            }
            else {
                throw new Error();
            }
        };
        /**
         * @language zh_CN
         * 替换骨架的主贴图，根据渲染引擎的不同，提供不同的贴图数据。
         * @param texture 用来替换的贴图，根据渲染平台的不同，类型会有所不同，一般是 Texture 类型。
         * @version DragonBones 4.5
         */
        p.replaceTexture = function (texture) {
            this._replacedTexture = texture;
            for (var i = 0, l = this._slots.length; i < l; ++i) {
                this._slots[i].invalidUpdate();
            }
        };
        /**
         * @language zh_CN
         * 获取所有骨骼。
         * @see dragonBones.Bone
         * @version DragonBones 3.0
         */
        p.getBones = function () {
            return this._bones;
        };
        /**
         * @language zh_CN
         * 获取所有插槽。
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         */
        p.getSlots = function () {
            return this._slots;
        };
        d(p, "name"
            /**
             * @language zh_CN
             * 骨架名称。
             * @see dragonBones.ArmatureData#name
             * @version DragonBones 3.0
             */
            ,function () {
                return this._armatureData ? this._armatureData.name : null;
            }
        );
        d(p, "armatureData"
            /**
             * @language zh_CN
             * 获取骨架数据。
             * @see dragonBones.ArmatureData
             * @version DragonBones 4.5
             */
            ,function () {
                return this._armatureData;
            }
        );
        d(p, "animation"
            /**
             * @language zh_CN
             * 获得动画控制器。
             * @see dragonBones.Animation
             * @version DragonBones 3.0
             */
            ,function () {
                return this._animation;
            }
        );
        d(p, "display"
            /**
             * @language zh_CN
             * 获取显示容器，插槽的显示对象都会以此显示容器为父级，根据渲染平台的不同，类型会不同，通常是 DisplayObjectContainer 类型。
             * @version DragonBones 3.0
             */
            ,function () {
                return this._display;
            }
        );
        d(p, "parent"
            /**
             * @language zh_CN
             * 获取父插槽。 (当此骨架是某个骨架的子骨架时，可以通过此属性向上查找从属关系)
             * @see dragonBones.Slot
             * @version DragonBones 4.5
             */
            ,function () {
                return this._parent;
            }
        );
        d(p, "cacheFrameRate"
            /**
             * @language zh_CN
             * 动画缓存的帧率，当设置一个大于 0 的帧率时，将会开启动画缓存。
             * 通过将动画数据缓存在内存中来提高运行性能，会有一定的内存开销。
             * 帧率不宜设置的过高，通常跟动画的帧率相当且低于程序运行的帧率。
             * 开启动画缓存后，某些功能将会失效，比如 Bone 和 Slot 的 offset 属性等。
             * @see dragonBones.DragonBonesData#frameRate
             * @see dragonBones.ArmatureData#frameRate
             * @version DragonBones 4.5
             */
            ,function () {
                return this._armatureData.cacheFrameRate;
            }
            ,function (value) {
                if (this._armatureData.cacheFrameRate != value) {
                    this._armatureData.cacheFrames(value);
                    // Set child armature frameRate.
                    for (var i = 0, l = this._slots.length; i < l; ++i) {
                        var slot = this._slots[i];
                        var childArmature = slot.childArmature;
                        if (childArmature) {
                            childArmature.cacheFrameRate = value;
                        }
                    }
                }
            }
        );
        /**
         * @language zh_CN
         * 开启动画缓存。
         * @param frameRate 动画缓存的帧率
         * @see #cacheFrameRate
         * @version DragonBones 4.5
         */
        p.enableAnimationCache = function (frameRate) {
            this.cacheFrameRate = frameRate;
        };
        /**
         * @language zh_CN
         * 是否包含指定类型的事件。
         * @param type 事件类型。
         * @returns  [true: 包含, false: 不包含]
         * @version DragonBones 3.0
         */
        p.hasEventListener = function (type) {
            this._display.hasEvent(type);
        };
        /**
         * @language zh_CN
         * 添加事件。
         * @param type 事件类型。
         * @param listener 事件回调。
         * @version DragonBones 3.0
         */
        p.addEventListener = function (type, listener, target) {
            this._display.addEvent(type, listener, target);
        };
        /**
         * @language zh_CN
         * 移除事件。
         * @param type 事件类型。
         * @param listener 事件回调。
         * @version DragonBones 3.0
         */
        p.removeEventListener = function (type, listener, target) {
            this._display.removeEvent(type, listener, target);
        };
        /**
         * @deprecated
         * @see #display
         */
        p.getDisplay = function () {
            return this._display;
        };
        /**
         * @private
         */
        Armature._soundEventManager = null;
        return Armature;
    }(dragonBones.BaseObject));
    dragonBones.Armature = Armature;
    egret.registerClass(Armature,'dragonBones.Armature',["dragonBones.IAnimateble"]);
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 基础变换对象。
     * @version DragonBones 4.5
     */
    var TransformObject = (function (_super) {
        __extends(TransformObject, _super);
        /**
         * @private
         */
        function TransformObject() {
            _super.call(this);
            /**
             * @language zh_CN
             * 相对于骨架坐标系的变换。
             * @see dragonBones.Transform
             * @version DragonBones 3.0
             */
            this.global = new dragonBones.Transform();
            /**
             * @language zh_CN
             * 相对于骨架或父骨骼坐标系的绑定变换。
             * @see dragonBones.Transform
             * @version DragonBones 3.0
             */
            this.origin = new dragonBones.Transform();
            /**
             * @language zh_CN
             * 相对于骨架或父骨骼坐标系的偏移变换。
             * @see dragonBones.Transform
             * @version DragonBones 3.0
             */
            this.offset = new dragonBones.Transform();
            /**
             * @private
             */
            this._globalTransformMatrix = new dragonBones.Matrix();
        }
        var d = __define,c=TransformObject,p=c.prototype;
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.userData = null;
            self.name = null;
            self.globalTransformMatrix = self._globalTransformMatrix;
            self.global.identity();
            self.origin.identity();
            self.offset.identity();
            self._armature = null;
            self._parent = null;
            self._globalTransformMatrix.identity();
        };
        /**
         * @private
         */
        p._setArmature = function (value) {
            this._armature = value;
        };
        /**
         * @private
         */
        p._setParent = function (value) {
            this._parent = value;
        };
        d(p, "armature"
            /**
             * @language zh_CN
             * 所属的骨架。
             * @see dragonBones.Armature
             * @version DragonBones 3.0
             */
            ,function () {
                return this._armature;
            }
        );
        d(p, "parent"
            /**
             * @language zh_CN
             * 所属的父骨骼。
             * @see dragonBones.Bone
             * @version DragonBones 3.0
             */
            ,function () {
                return this._parent;
            }
        );
        return TransformObject;
    }(dragonBones.BaseObject));
    dragonBones.TransformObject = TransformObject;
    egret.registerClass(TransformObject,'dragonBones.TransformObject');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 骨骼，一个骨架中可以包含多个骨骼，骨骼以树状结构组成骨架。
     * 骨骼在骨骼动画体系中是最重要的逻辑单元之一，负责动画中的平移旋转缩放的实现。
     * @see dragonBones.BoneData
     * @see dragonBones.Armature
     * @see dragonBones.Slot
     * @version DragonBones 3.0
     */
    var Bone = (function (_super) {
        __extends(Bone, _super);
        /**
         * @private
         */
        function Bone() {
            _super.call(this);
            /**
             * @private
             */
            this._animationPose = new dragonBones.Transform();
            /**
             * @private
             */
            this._bones = [];
            /**
             * @private
             */
            this._slots = [];
        }
        var d = __define,c=Bone,p=c.prototype;
        /**
         * @private
         */
        Bone.toString = function () {
            return "[Class dragonBones.Bone]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.inheritTranslation = false;
            self.inheritRotation = false;
            self.inheritScale = false;
            self.ikBendPositive = false;
            self.ikWeight = 0;
            self.length = 0;
            self._transformDirty = 2 /* All */; // Update
            self._blendIndex = 0;
            self._cacheFrames = null;
            self._animationPose.identity();
            self._visible = true;
            self._ikChain = 0;
            self._ikChainIndex = 0;
            self._ik = null;
            if (self._bones.length) {
                self._bones.length = 0;
            }
            if (self._slots.length) {
                self._slots.length = 0;
            }
        };
        /**
         * @private
         */
        p._updateGlobalTransformMatrix = function () {
            var self = this;
            if (self._parent) {
                var parentRotation = self._parent.global.skewY; // Only inherit skew y.
                var parentMatrix = self._parent.globalTransformMatrix;
                if (self.inheritScale) {
                    if (!self.inheritRotation) {
                        self.global.skewX -= parentRotation;
                        self.global.skewY -= parentRotation;
                    }
                    self.global.toMatrix(self.globalTransformMatrix);
                    self.globalTransformMatrix.concat(parentMatrix);
                    if (!self.inheritTranslation) {
                        self.globalTransformMatrix.tx = self.global.x;
                        self.globalTransformMatrix.ty = self.global.y;
                    }
                    self.global.fromMatrix(self.globalTransformMatrix);
                }
                else {
                    if (self.inheritTranslation) {
                        var x = self.global.x;
                        var y = self.global.y;
                        self.global.x = parentMatrix.a * x + parentMatrix.c * y + parentMatrix.tx;
                        self.global.y = parentMatrix.d * y + parentMatrix.b * x + parentMatrix.ty;
                    }
                    if (self.inheritRotation) {
                        self.global.skewX += parentRotation;
                        self.global.skewY += parentRotation;
                    }
                    self.global.toMatrix(self.globalTransformMatrix);
                }
            }
            else {
                self.global.toMatrix(self.globalTransformMatrix);
            }
        };
        /**
         * @private
         */
        p._computeIKA = function () {
            var self = this;
            var ikGlobal = self._ik.global;
            var x = self.globalTransformMatrix.a * self.length;
            var y = self.globalTransformMatrix.b * self.length;
            var ikRadian = (Math.atan2(ikGlobal.y - self.global.y, ikGlobal.x - self.global.x) +
                self.offset.skewY -
                self.global.skewY * 2 +
                Math.atan2(y, x)) * self.ikWeight; // Support offset.
            self.global.skewX += ikRadian;
            self.global.skewY += ikRadian;
            self.global.toMatrix(self.globalTransformMatrix);
        };
        /**
         * @private
         */
        p._computeIKB = function () {
            var self = this;
            var parentGlobal = self._parent.global;
            var ikGlobal = self._ik.global;
            var x = self.globalTransformMatrix.a * self.length;
            var y = self.globalTransformMatrix.b * self.length;
            var lLL = x * x + y * y;
            var lL = Math.sqrt(lLL);
            var dX = self.global.x - parentGlobal.x;
            var dY = self.global.y - parentGlobal.y;
            var lPP = dX * dX + dY * dY;
            var lP = Math.sqrt(lPP);
            dX = ikGlobal.x - parentGlobal.x;
            dY = ikGlobal.y - parentGlobal.y;
            var lTT = dX * dX + dY * dY;
            var lT = Math.sqrt(lTT);
            var ikRadianA = 0;
            if (lL + lP <= lT || lT + lL <= lP || lT + lP <= lL) {
                ikRadianA = Math.atan2(ikGlobal.y - parentGlobal.y, ikGlobal.x - parentGlobal.x) + self._parent.offset.skewY; // Support offset.
                if (lL + lP <= lT) {
                }
                else if (lP < lL) {
                    ikRadianA += Math.PI;
                }
            }
            else {
                var h = (lPP - lLL + lTT) / (2 * lTT);
                var r = Math.sqrt(lPP - h * h * lTT) / lT;
                var hX = parentGlobal.x + (dX * h);
                var hY = parentGlobal.y + (dY * h);
                var rX = -dY * r;
                var rY = dX * r;
                if (self.ikBendPositive) {
                    self.global.x = hX - rX;
                    self.global.y = hY - rY;
                }
                else {
                    self.global.x = hX + rX;
                    self.global.y = hY + rY;
                }
                ikRadianA = Math.atan2(self.global.y - parentGlobal.y, self.global.x - parentGlobal.x) + self._parent.offset.skewY; // Support offset.
            }
            ikRadianA = (ikRadianA - parentGlobal.skewY) * self.ikWeight;
            parentGlobal.skewX += ikRadianA;
            parentGlobal.skewY += ikRadianA;
            parentGlobal.toMatrix(self._parent.globalTransformMatrix);
            self._parent._transformDirty = 1 /* Self */;
            self.global.x = parentGlobal.x + Math.cos(parentGlobal.skewY) * lP;
            self.global.y = parentGlobal.y + Math.sin(parentGlobal.skewY) * lP;
            var ikRadianB = (Math.atan2(ikGlobal.y - self.global.y, ikGlobal.x - self.global.x) + self.offset.skewY -
                self.global.skewY * 2 + Math.atan2(y, x)) * self.ikWeight; // Support offset.
            self.global.skewX += ikRadianB;
            self.global.skewY += ikRadianB;
            self.global.toMatrix(self.globalTransformMatrix);
        };
        /**
         * @inheritDoc
         */
        p._setArmature = function (value) {
            var self = this;
            if (self._armature == value) {
                return;
            }
            self._ik = null;
            var oldSlots = null;
            var oldBones = null;
            if (self._armature) {
                oldSlots = self.getSlots();
                oldBones = self.getBones();
                self._armature._removeBoneFromBoneList(this);
            }
            self._armature = value;
            if (self._armature) {
                self._armature._addBoneToBoneList(this);
            }
            if (oldSlots) {
                for (var i = 0, l = oldSlots.length; i < l; ++i) {
                    var slot = oldSlots[i];
                    if (slot.parent == this) {
                        slot._setArmature(self._armature);
                    }
                }
            }
            if (oldBones) {
                for (var i = 0, l = oldBones.length; i < l; ++i) {
                    var bone = oldBones[i];
                    if (bone.parent == this) {
                        bone._setArmature(self._armature);
                    }
                }
            }
        };
        /**
         * @private
         */
        p._setIK = function (value, chain, chainIndex) {
            var self = this;
            if (value) {
                if (chain == chainIndex) {
                    var chainEnd = self._parent;
                    if (chain && chainEnd) {
                        chain = 1;
                    }
                    else {
                        chain = 0;
                        chainIndex = 0;
                        chainEnd = this;
                    }
                    if (chainEnd == value || chainEnd.contains(value)) {
                        value = null;
                        chain = 0;
                        chainIndex = 0;
                    }
                    else {
                        var ancestor = value;
                        while (ancestor.ik && ancestor.ikChain) {
                            if (chainEnd.contains(ancestor.ik)) {
                                value = null;
                                chain = 0;
                                chainIndex = 0;
                                break;
                            }
                            ancestor = ancestor.parent;
                        }
                    }
                }
            }
            else {
                chain = 0;
                chainIndex = 0;
            }
            self._ik = value;
            self._ikChain = chain;
            self._ikChainIndex = chainIndex;
            if (self._armature) {
                self._armature._bonesDirty = true;
            }
        };
        /**
         * @private
         */
        p._update = function (cacheFrameIndex) {
            var self = this;
            self._blendIndex = 0;
            if (cacheFrameIndex >= 0) {
                var cacheFrame = self._cacheFrames[cacheFrameIndex];
                if (self.globalTransformMatrix == cacheFrame) {
                    self._transformDirty = 0 /* None */;
                }
                else if (cacheFrame) {
                    self._transformDirty = 2 /* All */; // For update children and ik children.
                    self.globalTransformMatrix = cacheFrame;
                }
                else if (self._transformDirty == 2 /* All */ ||
                    (self._parent && self._parent._transformDirty != 0 /* None */) ||
                    (self._ik && self.ikWeight > 0 && self._ik._transformDirty != 0 /* None */)) {
                    self._transformDirty = 2 /* All */; // For update children and ik children.
                    self.globalTransformMatrix = self._globalTransformMatrix;
                }
                else if (self.globalTransformMatrix != self._globalTransformMatrix) {
                    self._transformDirty = 0 /* None */;
                    self._cacheFrames[cacheFrameIndex] = self.globalTransformMatrix;
                }
                else {
                    self._transformDirty = 1 /* Self */;
                    self.globalTransformMatrix = self._globalTransformMatrix;
                }
            }
            else if (self._transformDirty == 2 /* All */ ||
                (self._parent && self._parent._transformDirty != 0 /* None */) ||
                (self._ik && self.ikWeight > 0 && self._ik._transformDirty != 0 /* None */)) {
                self._transformDirty = 2 /* All */; // For update children and ik children.
                self.globalTransformMatrix = self._globalTransformMatrix;
            }
            if (self._transformDirty != 0 /* None */) {
                if (self._transformDirty == 2 /* All */) {
                    self._transformDirty = 1 /* Self */;
                }
                else {
                    self._transformDirty = 0 /* None */;
                }
                if (self.globalTransformMatrix == self._globalTransformMatrix) {
                    /*self.global.copyFrom(self.origin).add(self.offset).add(self._animationPose);*/
                    self.global.x = self.origin.x + self.offset.x + self._animationPose.x;
                    self.global.y = self.origin.y + self.offset.y + self._animationPose.y;
                    self.global.skewX = self.origin.skewX + self.offset.skewX + self._animationPose.skewX;
                    self.global.skewY = self.origin.skewY + self.offset.skewY + self._animationPose.skewY;
                    self.global.scaleX = self.origin.scaleX * self.offset.scaleX * self._animationPose.scaleX;
                    self.global.scaleY = self.origin.scaleY * self.offset.scaleY * self._animationPose.scaleY;
                    self._updateGlobalTransformMatrix();
                    if (self._ik && self._ikChainIndex == self._ikChain && self.ikWeight > 0) {
                        if (self.inheritTranslation && self._ikChain > 0 && self._parent) {
                            self._computeIKB();
                        }
                        else {
                            self._computeIKA();
                        }
                    }
                    if (cacheFrameIndex >= 0) {
                        self.globalTransformMatrix = dragonBones.BoneTimelineData.cacheFrame(self._cacheFrames, cacheFrameIndex, self._globalTransformMatrix);
                    }
                }
            }
        };
        /**
         * @language zh_CN
         * 下一帧更新变换。 (当骨骼没有动画状态或动画状态播放完成时，骨骼将不在更新)
         * @version DragonBones 3.0
         */
        p.invalidUpdate = function () {
            this._transformDirty = 2 /* All */;
        };
        /**
         * @language zh_CN
         * 是否包含某个指定的骨骼或插槽。
         * @returns [true: 包含，false: 不包含]
         * @see dragonBones.TransformObject
         * @version DragonBones 3.0
         */
        p.contains = function (child) {
            if (child) {
                if (child == this) {
                    return false;
                }
                var ancestor = child;
                while (ancestor != this && ancestor) {
                    ancestor = ancestor.parent;
                }
                return ancestor == this;
            }
            return false;
        };
        /**
         * @language zh_CN
         * 所有的子骨骼。
         * @version DragonBones 3.0
         */
        p.getBones = function () {
            this._bones.length = 0;
            var bones = this._armature.getBones();
            for (var i = 0, l = bones.length; i < l; ++i) {
                var bone = bones[i];
                if (bone.parent == this) {
                    this._bones.push(bone);
                }
            }
            return this._bones;
        };
        /**
         * @language zh_CN
         * 所有的插槽。
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         */
        p.getSlots = function () {
            this._slots.length = 0;
            var slots = this._armature.getSlots();
            for (var i = 0, l = slots.length; i < l; ++i) {
                var slot = slots[i];
                if (slot.parent == this) {
                    this._slots.push(slot);
                }
            }
            return this._slots;
        };
        d(p, "ikChain"
            /**
             * @private
             */
            ,function () {
                return this._ikChain;
            }
        );
        d(p, "ikChainIndex"
            /**
             * @private
             */
            ,function () {
                return this._ikChainIndex;
            }
        );
        d(p, "ik"
            /**
             * @language zh_CN
             * 当前的 IK 约束目标。
             * @version DragonBones 4.5
             */
            ,function () {
                return this._ik;
            }
        );
        d(p, "visible"
            /**
             * @language zh_CN
             * 控制此骨骼所有插槽的显示。
             * @default true
             * @see dragonBones.Slot
             * @version DragonBones 3.0
             */
            ,function () {
                return this._visible;
            }
            ,function (value) {
                if (this._visible == value) {
                    return;
                }
                this._visible = value;
                var slots = this._armature.getSlots();
                for (var i = 0, l = slots.length; i < l; ++i) {
                    var slot = slots[i];
                    if (slot._parent == this) {
                        slot._updateVisible();
                    }
                }
            }
        );
        d(p, "slot"
            /**
             * @deprecated
             * @see dragonBones.Armature#getSlot()
             */
            ,function () {
                var slots = this._armature.getSlots();
                for (var i = 0, l = slots.length; i < l; ++i) {
                    var slot = slots[i];
                    if (slot.parent == this) {
                        return slot;
                    }
                }
                return null;
            }
        );
        return Bone;
    }(dragonBones.TransformObject));
    dragonBones.Bone = Bone;
    egret.registerClass(Bone,'dragonBones.Bone');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 插槽，附着在骨骼上，控制显示对象的显示状态和属性。
     * 一个骨骼上可以包含多个插槽。
     * 一个插槽中可以包含多个显示对象，同一时间只能显示其中的一个显示对象，但可以在动画播放的过程中切换显示对象实现帧动画。
     * 显示对象可以是普通的图片纹理，也可以是子骨架的显示容器，网格显示对象，还可以是自定义的其他显示对象。
     * @see dragonBones.Armature
     * @see dragonBones.Bone
     * @see dragonBones.SlotData
     * @version DragonBones 3.0
     */
    var Slot = (function (_super) {
        __extends(Slot, _super);
        /**
         * @private
         */
        function Slot() {
            _super.call(this);
            /**
             * @private
             */
            this._colorTransform = new dragonBones.ColorTransform();
            /**
             * @private
             */
            this._ffdVertices = [];
            /**
             * @private
             */
            this._replacedDisplayDataSet = [];
            /**
             * @private
             */
            this._localMatrix = new dragonBones.Matrix();
            /**
             * @private
             */
            this._displayList = [];
            /**
             * @private
             */
            this._meshBones = [];
        }
        var d = __define,c=Slot,p=c.prototype;
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            var disposeDisplayList = [];
            for (var i = 0, l = self._displayList.length; i < l; ++i) {
                var eachDisplay = self._displayList[i];
                if (eachDisplay != self._rawDisplay && eachDisplay != self._meshDisplay &&
                    disposeDisplayList.indexOf(eachDisplay) < 0) {
                    disposeDisplayList.push(eachDisplay);
                }
            }
            for (var i = 0, l = disposeDisplayList.length; i < l; ++i) {
                var eachDisplay = disposeDisplayList[i];
                if (eachDisplay instanceof dragonBones.Armature) {
                    eachDisplay.returnToPool();
                }
                else {
                    self._disposeDisplay(eachDisplay);
                }
            }
            if (self._meshDisplay && self._meshDisplay != self._rawDisplay) {
                self._disposeDisplay(self._meshDisplay);
            }
            if (self._rawDisplay) {
                self._disposeDisplay(self._rawDisplay);
            }
            self.inheritAnimation = true;
            self.displayController = null;
            self._colorDirty = false;
            self._ffdDirty = false;
            self._blendIndex = 0;
            self._zOrder = 0;
            self._displayDataSet = null;
            self._meshData = null;
            self._cacheFrames = null;
            self._rawDisplay = null;
            self._meshDisplay = null;
            self._colorTransform.identity();
            if (self._ffdVertices.length) {
                self._ffdVertices.length = 0;
            }
            if (self._replacedDisplayDataSet.length) {
                self._replacedDisplayDataSet.length = 0;
            }
            self._displayDirty = false;
            self._blendModeDirty = false;
            self._originDirty = false;
            self._transformDirty = false;
            self._displayIndex = 0;
            self._blendMode = 0 /* Normal */;
            self._display = null;
            self._childArmature = null;
            self._localMatrix.identity();
            if (self._displayList.length) {
                self._displayList.length = 0;
            }
            if (self._meshBones.length) {
                self._meshBones.length = 0;
            }
        };
        /**
         * @private
         */
        p._isMeshBonesUpdate = function () {
            for (var i = 0, l = this._meshBones.length; i < l; ++i) {
                if (this._meshBones[i]._transformDirty != 0 /* None */) {
                    return true;
                }
            }
            return false;
        };
        /**
         * @private
         */
        p._updateDisplay = function () {
            var self = this;
            var prevDisplay = self._display || self._rawDisplay;
            var prevChildArmature = self._childArmature;
            if (self._displayIndex >= 0 && self._displayIndex < self._displayList.length) {
                self._display = self._displayList[self._displayIndex];
                if (self._display instanceof dragonBones.Armature) {
                    self._childArmature = self._display;
                    self._display = self._childArmature._display;
                }
                else {
                    self._childArmature = null;
                }
            }
            else {
                self._display = null;
                self._childArmature = null;
            }
            var currentDisplay = self._display || self._rawDisplay;
            if (currentDisplay != prevDisplay) {
                self._onUpdateDisplay();
                if (prevDisplay) {
                    self._replaceDisplay(prevDisplay);
                }
                else {
                    self._addDisplay();
                }
                self._blendModeDirty = true;
                self._colorDirty = true;
            }
            // Update origin.
            if (self._displayDataSet && self._displayIndex >= 0 && self._displayIndex < self._displayDataSet.displays.length) {
                self.origin.copyFrom(self._displayDataSet.displays[self._displayIndex].transform);
                self._originDirty = true;
            }
            // Update meshData.
            self._updateMeshData(false);
            // Update frame.
            if (currentDisplay == self._rawDisplay || currentDisplay == self._meshDisplay) {
                self._updateFrame();
            }
            // Update child armature.
            if (self._childArmature != prevChildArmature) {
                if (prevChildArmature) {
                    prevChildArmature._parent = null; // Update child armature parent.
                    if (self.inheritAnimation) {
                        prevChildArmature.animation.reset();
                    }
                }
                if (self._childArmature) {
                    self._childArmature._parent = this; // Update child armature parent.
                    if (self.inheritAnimation) {
                        // Set child armature frameRate.
                        var cacheFrameRate = self._armature.cacheFrameRate;
                        if (cacheFrameRate) {
                            self._childArmature.cacheFrameRate = cacheFrameRate;
                        }
                        var slotData = self._armature.armatureData.getSlot(self.name);
                        if (slotData.actions.length > 0) {
                            self._childArmature._action = slotData.actions[slotData.actions.length - 1];
                        }
                        else {
                            self._childArmature.animation.play();
                        }
                    }
                }
            }
        };
        /**
         * @private
         */
        p._updateLocalTransformMatrix = function () {
            var self = this;
            self.global.copyFrom(self.origin).add(self.offset).toMatrix(self._localMatrix);
        };
        /**
         * @private
         */
        p._updateGlobalTransformMatrix = function () {
            var self = this;
            self.globalTransformMatrix.copyFrom(self._localMatrix);
            self.globalTransformMatrix.concat(self._parent.globalTransformMatrix);
            self.global.fromMatrix(self.globalTransformMatrix);
        };
        /**
         * @inheritDoc
         */
        p._setArmature = function (value) {
            var self = this;
            if (self._armature == value) {
                return;
            }
            if (self._armature) {
                self._armature._removeSlotFromSlotList(this);
            }
            self._armature = value;
            self._onUpdateDisplay();
            if (self._armature) {
                self._armature._addSlotToSlotList(this);
                self._addDisplay();
            }
            else {
                self._removeDisplay();
            }
        };
        /**
         * @private Armature
         */
        p._updateMeshData = function (isTimelineUpdate) {
            var self = this;
            var prevMeshData = self._meshData;
            if (self._display == self._meshDisplay && self._displayDataSet && self._displayIndex >= 0 && self._displayIndex < self._displayDataSet.displays.length) {
                self._meshData = self._displayDataSet.displays[self._displayIndex].meshData;
            }
            else {
                self._meshData = null;
            }
            if (self._meshData != prevMeshData) {
                if (self._meshData) {
                    if (self._meshData.skinned) {
                        self._meshBones.length = self._meshData.bones.length;
                        for (var i = 0, l = self._meshBones.length; i < l; ++i) {
                            self._meshBones[i] = self._armature.getBone(self._meshData.bones[i].name);
                        }
                        var ffdVerticesCount = 0;
                        for (var i = 0, l = self._meshData.boneIndices.length; i < l; ++i) {
                            ffdVerticesCount += self._meshData.boneIndices[i].length;
                        }
                        self._ffdVertices.length = ffdVerticesCount * 2;
                    }
                    else {
                        self._meshBones.length = 0;
                        self._ffdVertices.length = self._meshData.vertices.length;
                    }
                    for (var i = 0, l = self._ffdVertices.length; i < l; ++i) {
                        self._ffdVertices[i] = 0;
                    }
                    self._ffdDirty = true;
                }
                else {
                    self._meshBones.length = 0;
                    self._ffdVertices.length = 0;
                }
                if (isTimelineUpdate) {
                    self._armature.animation._updateFFDTimelineStates();
                }
            }
        };
        /**
         * @private Armature
         */
        p._update = function (cacheFrameIndex) {
            var self = this;
            self._blendIndex = 0;
            if (self._displayDirty) {
                self._displayDirty = false;
                self._updateDisplay();
            }
            if (!self._display) {
                return;
            }
            if (self._blendModeDirty) {
                self._blendModeDirty = false;
                self._updateBlendMode();
            }
            if (self._colorDirty) {
                self._colorDirty = false;
                self._updateColor();
            }
            if (self._meshData) {
                if (self._ffdDirty || (self._meshData.skinned && self._isMeshBonesUpdate())) {
                    self._ffdDirty = false;
                    self._updateMesh();
                }
                if (self._meshData.skinned) {
                    return;
                }
            }
            if (self._originDirty) {
                self._originDirty = false;
                self._transformDirty = true;
                self._updateLocalTransformMatrix();
            }
            if (cacheFrameIndex >= 0) {
                var cacheFrame = self._cacheFrames[cacheFrameIndex];
                if (self.globalTransformMatrix == cacheFrame) {
                    self._transformDirty = false;
                }
                else if (cacheFrame) {
                    self._transformDirty = true;
                    self.globalTransformMatrix = cacheFrame;
                }
                else if (self._transformDirty || self._parent._transformDirty != 0 /* None */) {
                    self._transformDirty = true;
                    self.globalTransformMatrix = self._globalTransformMatrix;
                }
                else if (self.globalTransformMatrix != self._globalTransformMatrix) {
                    self._transformDirty = false;
                    self._cacheFrames[cacheFrameIndex] = self.globalTransformMatrix;
                }
                else {
                    self._transformDirty = true;
                    self.globalTransformMatrix = self._globalTransformMatrix;
                }
            }
            else if (self._transformDirty || self._parent._transformDirty != 0 /* None */) {
                self._transformDirty = true;
                self.globalTransformMatrix = self._globalTransformMatrix;
            }
            if (self._transformDirty) {
                self._transformDirty = false;
                if (self.globalTransformMatrix == self._globalTransformMatrix) {
                    self._updateGlobalTransformMatrix();
                    if (cacheFrameIndex >= 0) {
                        self.globalTransformMatrix = dragonBones.SlotTimelineData.cacheFrame(self._cacheFrames, cacheFrameIndex, self._globalTransformMatrix);
                    }
                }
                self._updateTransform();
            }
        };
        /**
         * @private Factory
         */
        p._setDisplayList = function (value) {
            var self = this;
            if (value && value.length) {
                if (self._displayList.length != value.length) {
                    self._displayList.length = value.length;
                }
                for (var i = 0, l = self._displayList.length; i < l; ++i) {
                    var eachDisplay = value[i];
                    if (eachDisplay && eachDisplay != self._rawDisplay && eachDisplay != self._meshDisplay && !(eachDisplay instanceof dragonBones.Armature) &&
                        self._displayList.indexOf(eachDisplay) < 0) {
                        self._initDisplay(eachDisplay);
                    }
                    self._displayList[i] = eachDisplay;
                }
            }
            else if (self._displayList.length) {
                self._displayList.length = 0;
            }
            if (self._displayIndex >= 0 && self._displayIndex < self._displayList.length) {
                self._displayDirty = self._display != self._displayList[self._displayIndex];
            }
            else {
                self._displayDirty = self._display != null;
            }
            return self._displayDirty;
        };
        /**
         * @private Factory
         */
        p._setDisplayIndex = function (value) {
            if (this._displayIndex == value) {
                return false;
            }
            this._displayIndex = value;
            this._displayDirty = true;
            return this._displayDirty;
        };
        /**
         * @private Factory
         */
        p._setBlendMode = function (value) {
            if (this._blendMode == value) {
                return false;
            }
            this._blendMode = value;
            this._blendModeDirty = true;
            return true;
        };
        /**
         * @private Factory
         */
        p._setColor = function (value) {
            this._colorTransform.copyFrom(value);
            this._colorDirty = true;
            return true;
        };
        /**
         * @language zh_CN
         * 在下一帧更新显示对象的状态。
         * @version DragonBones 4.5
         */
        p.invalidUpdate = function () {
            this._displayDirty = true;
        };
        d(p, "rawDisplay"
            /**
             * @private
             */
            ,function () {
                return this._rawDisplay;
            }
        );
        d(p, "MeshDisplay"
            /**
             * @private
             */
            ,function () {
                return this._meshDisplay;
            }
        );
        d(p, "displayIndex"
            /**
             * @language zh_CN
             * 此时显示的显示对象在显示列表中的索引。
             * @version DragonBones 4.5
             */
            ,function () {
                return this._displayIndex;
            }
            ,function (value) {
                if (this._setDisplayIndex(value)) {
                    this._update(-1);
                }
            }
        );
        d(p, "displayList"
            /**
             * @language zh_CN
             * 包含显示对象或子骨架的显示列表。
             * @version DragonBones 3.0
             */
            ,function () {
                return this._displayList.concat();
            }
            ,function (value) {
                var self = this;
                var backupDisplayList = self._displayList.concat(); // Copy.
                var disposeDisplayList = [];
                if (self._setDisplayList(value)) {
                    self._update(-1);
                }
                // Release replaced render displays.
                for (var i = 0, l = backupDisplayList.length; i < l; ++i) {
                    var eachDisplay = backupDisplayList[i];
                    if (eachDisplay != self._rawDisplay && eachDisplay != self._meshDisplay &&
                        self._displayList.indexOf(eachDisplay) < 0 &&
                        disposeDisplayList.indexOf(eachDisplay) < 0) {
                        disposeDisplayList.push(eachDisplay);
                    }
                }
                for (var i = 0, l = disposeDisplayList.length; i < l; ++i) {
                    var eachDisplay = disposeDisplayList[i];
                    if (eachDisplay instanceof dragonBones.Armature) {
                        (eachDisplay).returnToPool();
                    }
                    else {
                        self._disposeDisplay(eachDisplay);
                    }
                }
            }
        );
        d(p, "display"
            /**
             * @language zh_CN
             * 此时显示的显示对象。
             * @version DragonBones 3.0
             */
            ,function () {
                return this._display;
            }
            ,function (value) {
                var self = this;
                if (self._display == value) {
                    return;
                }
                var displayListLength = self._displayList.length;
                if (self._displayIndex < 0 && displayListLength == 0) {
                    self._displayIndex = 0;
                }
                if (self._displayIndex < 0) {
                    return;
                }
                else {
                    var replaceDisplayList = self.displayList; // Copy.
                    if (displayListLength <= self._displayIndex) {
                        replaceDisplayList.length = self._displayIndex + 1;
                    }
                    replaceDisplayList[self._displayIndex] = value;
                    self.displayList = replaceDisplayList;
                }
            }
        );
        d(p, "childArmature"
            /**
             * @language zh_CN
             * 此时显示的子骨架。
             * @see dragonBones.Armature
             * @version DragonBones 3.0
             */
            ,function () {
                return this._childArmature;
            }
            ,function (value) {
                if (this._childArmature == value) {
                    return;
                }
                this.display = value;
            }
        );
        /**
         * @deprecated
         * @see #display
         */
        p.getDisplay = function () {
            return this._display;
        };
        /**
         * @deprecated
         * @see #display
         */
        p.setDisplay = function (value) {
            this.display = value;
        };
        return Slot;
    }(dragonBones.TransformObject));
    dragonBones.Slot = Slot;
    egret.registerClass(Slot,'dragonBones.Slot');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * DragonBones
     */
    var DragonBones = (function () {
        /**
         * @private
         */
        function DragonBones() {
        }
        var d = __define,c=DragonBones,p=c.prototype;
        /**
         * @private
         */
        DragonBones.hasArmature = function (value) {
            return DragonBones._armatures.indexOf(value) >= 0;
        };
        /**
         * @private
         */
        DragonBones.addArmature = function (value) {
            if (value && DragonBones._armatures.indexOf(value) < 0) {
                DragonBones._armatures.push(value);
            }
        };
        /**
         * @private
         */
        DragonBones.removeArmature = function (value) {
            if (value) {
                var index = DragonBones._armatures.indexOf(value);
                if (index >= 0) {
                    DragonBones._armatures.splice(index, 1);
                }
            }
        };
        /**
         * @private
         */
        DragonBones.PI_D = Math.PI * 2;
        /**
         * @private
         */
        DragonBones.PI_H = Math.PI / 2;
        /**
         * @private
         */
        DragonBones.PI_Q = Math.PI / 4;
        /**
         * @private
         */
        DragonBones.ANGLE_TO_RADIAN = Math.PI / 180;
        /**
         * @private
         */
        DragonBones.RADIAN_TO_ANGLE = 180 / Math.PI;
        /**
         * @private
         */
        DragonBones.SECOND_TO_MILLISECOND = 1000;
        /**
         * @private
         */
        DragonBones.NO_TWEEN = 100;
        DragonBones.VERSION = "4.7.1";
        /**
         * @private
         */
        DragonBones.DEBUG = true;
        /**
         * @private
         */
        DragonBones._armatures = [];
        return DragonBones;
    }());
    dragonBones.DragonBones = DragonBones;
    egret.registerClass(DragonBones,'dragonBones.DragonBones');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 事件数据。
     * @version DragonBones 4.5
     */
    var EventObject = (function (_super) {
        __extends(EventObject, _super);
        /**
         * @private
         */
        function EventObject() {
            _super.call(this);
        }
        var d = __define,c=EventObject,p=c.prototype;
        /**
         * @private
         */
        EventObject.toString = function () {
            return "[Class dragonBones.EventObject]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            this.type = null;
            this.name = null;
            this.data = null;
            this.armature = null;
            this.bone = null;
            this.slot = null;
            this.animationState = null;
            this.userData = null;
        };
        d(p, "animationName"
            /**
             * @see #animationState
             */
            ,function () {
                return this.animationState.name;
            }
        );
        /**
         * @language zh_CN
         * 动画开始。
         * @version DragonBones 4.5
         */
        EventObject.START = "start";
        /**
         * @language zh_CN
         * 动画循环播放一次完成。
         * @version DragonBones 4.5
         */
        EventObject.LOOP_COMPLETE = "loopComplete";
        /**
         * @language zh_CN
         * 动画播放完成。
         * @version DragonBones 4.5
         */
        EventObject.COMPLETE = "complete";
        /**
         * @language zh_CN
         * 动画淡入开始。
         * @version DragonBones 4.5
         */
        EventObject.FADE_IN = "fadeIn";
        /**
         * @language zh_CN
         * 动画淡入完成。
         * @version DragonBones 4.5
         */
        EventObject.FADE_IN_COMPLETE = "fadeInComplete";
        /**
         * @language zh_CN
         * 动画淡出开始。
         * @version DragonBones 4.5
         */
        EventObject.FADE_OUT = "fadeOut";
        /**
         * @language zh_CN
         * 动画淡出完成。
         * @version DragonBones 4.5
         */
        EventObject.FADE_OUT_COMPLETE = "fadeOutComplete";
        /**
         * @language zh_CN
         * 动画帧事件。
         * @version DragonBones 4.5
         */
        EventObject.FRAME_EVENT = "frameEvent";
        /**
         * @language zh_CN
         * 动画声音事件。
         * @version DragonBones 4.5
         */
        EventObject.SOUND_EVENT = "soundEvent";
        return EventObject;
    }(dragonBones.BaseObject));
    dragonBones.EventObject = EventObject;
    egret.registerClass(EventObject,'dragonBones.EventObject');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 贴图集数据。
     * @version DragonBones 3.0
     */
    var TextureAtlasData = (function (_super) {
        __extends(TextureAtlasData, _super);
        /**
         * @private
         */
        function TextureAtlasData() {
            _super.call(this);
            /**
             * @private
             */
            this.textures = {};
        }
        var d = __define,c=TextureAtlasData,p=c.prototype;
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.autoSearch = false;
            self.scale = 1;
            self.name = null;
            self.imagePath = null;
            for (var i in self.textures) {
                self.textures[i].returnToPool();
                delete self.textures[i];
            }
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#removeDragonBonesData()
         */
        p.dispose = function () {
            this.returnToPool();
        };
        /**
         * @private
         */
        p.addTextureData = function (value) {
            if (value && value.name && !this.textures[value.name]) {
                this.textures[value.name] = value;
                value.parent = this;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        p.getTextureData = function (name) {
            return this.textures[name];
        };
        return TextureAtlasData;
    }(dragonBones.BaseObject));
    dragonBones.TextureAtlasData = TextureAtlasData;
    egret.registerClass(TextureAtlasData,'dragonBones.TextureAtlasData');
    /**
     * @private
     */
    var TextureData = (function (_super) {
        __extends(TextureData, _super);
        function TextureData() {
            _super.call(this);
            this.region = new dragonBones.Rectangle();
        }
        var d = __define,c=TextureData,p=c.prototype;
        TextureData.generateRectangle = function () {
            return new dragonBones.Rectangle();
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.rotated = false;
            self.name = null;
            self.frame = null;
            self.parent = null;
            self.region.clear();
        };
        return TextureData;
    }(dragonBones.BaseObject));
    dragonBones.TextureData = TextureData;
    egret.registerClass(TextureData,'dragonBones.TextureData');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * Egret 贴图集数据。
     * @version DragonBones 3.0
     */
    var EgretTextureAtlasData = (function (_super) {
        __extends(EgretTextureAtlasData, _super);
        /**
         * @private
         */
        function EgretTextureAtlasData() {
            _super.call(this);
        }
        var d = __define,c=EgretTextureAtlasData,p=c.prototype;
        /**
         * @private
         */
        EgretTextureAtlasData.toString = function () {
            return "[Class dragonBones.EgretTextureAtlasData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            _super.prototype._onClear.call(this);
            if (this.texture) {
                //this.texture.dispose();
                this.texture = null;
            }
        };
        /**
         * @private
         */
        p.generateTextureData = function () {
            return dragonBones.BaseObject.borrowObject(EgretTextureData);
        };
        return EgretTextureAtlasData;
    }(dragonBones.TextureAtlasData));
    dragonBones.EgretTextureAtlasData = EgretTextureAtlasData;
    egret.registerClass(EgretTextureAtlasData,'dragonBones.EgretTextureAtlasData');
    /**
     * @private
     */
    var EgretTextureData = (function (_super) {
        __extends(EgretTextureData, _super);
        function EgretTextureData() {
            _super.call(this);
        }
        var d = __define,c=EgretTextureData,p=c.prototype;
        EgretTextureData.toString = function () {
            return "[Class dragonBones.EgretTextureData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            _super.prototype._onClear.call(this);
            if (this.texture) {
                this.texture.dispose();
                this.texture = null;
            }
        };
        return EgretTextureData;
    }(dragonBones.TextureData));
    dragonBones.EgretTextureData = EgretTextureData;
    egret.registerClass(EgretTextureData,'dragonBones.EgretTextureData');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * Egret 事件。
     * @version DragonBones 4.5
     */
    var EgretEvent = (function (_super) {
        __extends(EgretEvent, _super);
        /**
         * @private
         */
        function EgretEvent(type, bubbles, cancelable, data) {
            _super.call(this, type, bubbles, cancelable, data);
        }
        var d = __define,c=EgretEvent,p=c.prototype;
        d(p, "eventObject"
            /**
             * @language zh_CN
             * 事件对象。
             * @version DragonBones 4.5
             */
            ,function () {
                return this.data;
            }
        );
        d(p, "frameLabel"
            /**
             * @see dragonBones.EventObject#name
             */
            ,function () {
                return this.eventObject.name;
            }
        );
        d(p, "sound"
            /**
             * @see dragonBones.EventObject#name
             */
            ,function () {
                return this.eventObject.name;
            }
        );
        d(p, "animationName"
            /**
             * @see dragonBones.EventObject#animationName
             */
            ,function () {
                return this.eventObject.animationState.name;
            }
        );
        d(p, "armature"
            /**
             * @see dragonBones.EventObject#armature
             */
            ,function () {
                return this.eventObject.armature;
            }
        );
        d(p, "bone"
            /**
             * @see dragonBones.EventObject#bone
             */
            ,function () {
                return this.eventObject.bone;
            }
        );
        d(p, "slot"
            /**
             * @see dragonBones.EventObject#slot
             */
            ,function () {
                return this.eventObject.slot;
            }
        );
        d(p, "animationState"
            /**
             * @see dragonBones.EventObject#animationState
             */
            ,function () {
                return this.eventObject.animationState;
            }
        );
        d(p, "movementID"
            /**
             * @deprecated
             * @see #animationName
             */
            ,function () {
                return this.animationName;
            }
        );
        /**
         * @see dragonBones.EventObject.START
         */
        EgretEvent.START = dragonBones.EventObject.START;
        /**
         * @see dragonBones.EventObject.LOOP_COMPLETE
         */
        EgretEvent.LOOP_COMPLETE = dragonBones.EventObject.LOOP_COMPLETE;
        /**
         * @see dragonBones.EventObject.COMPLETE
         */
        EgretEvent.COMPLETE = dragonBones.EventObject.COMPLETE;
        /**
         * @see dragonBones.EventObject.FADE_IN
         */
        EgretEvent.FADE_IN = dragonBones.EventObject.FADE_IN;
        /**
         * @see dragonBones.EventObject.FADE_IN_COMPLETE
         */
        EgretEvent.FADE_IN_COMPLETE = dragonBones.EventObject.FADE_IN_COMPLETE;
        /**
         * @see dragonBones.EventObject.FADE_OUT
         */
        EgretEvent.FADE_OUT = dragonBones.EventObject.FADE_OUT;
        /**
         * @see dragonBones.EventObject.FADE_OUT_COMPLETE
         */
        EgretEvent.FADE_OUT_COMPLETE = dragonBones.EventObject.FADE_OUT_COMPLETE;
        /**
         * @see dragonBones.EventObject.FRAME_EVENT
         */
        EgretEvent.FRAME_EVENT = dragonBones.EventObject.FRAME_EVENT;
        /**
         * @see dragonBones.EventObject.SOUND_EVENT
         */
        EgretEvent.SOUND_EVENT = dragonBones.EventObject.SOUND_EVENT;
        /**
         * @deprecated
         * @see dragonBones.EventObject.FRAME_EVENT
         */
        EgretEvent.ANIMATION_FRAME_EVENT = dragonBones.EventObject.FRAME_EVENT;
        /**
         * @deprecated
         * @see dragonBones.EventObject.FRAME_EVENT
         */
        EgretEvent.BONE_FRAME_EVENT = dragonBones.EventObject.FRAME_EVENT;
        /**
         * @deprecated
         * @see dragonBones.EventObject.FRAME_EVENT
         */
        EgretEvent.MOVEMENT_FRAME_EVENT = dragonBones.EventObject.FRAME_EVENT;
        return EgretEvent;
    }(egret.Event));
    dragonBones.EgretEvent = EgretEvent;
    egret.registerClass(EgretEvent,'dragonBones.EgretEvent');
    /**
     * @inheritDoc
     */
    var EgretArmatureDisplay = (function (_super) {
        __extends(EgretArmatureDisplay, _super);
        /**
         * @private
         */
        function EgretArmatureDisplay() {
            _super.call(this);
            if (!EgretArmatureDisplay._clock) {
                EgretArmatureDisplay._clock = new dragonBones.WorldClock();
                EgretArmatureDisplay._clock.time = egret.getTimer();
                egret.startTick(EgretArmatureDisplay._clockHandler, EgretArmatureDisplay);
            }
        }
        var d = __define,c=EgretArmatureDisplay,p=c.prototype;
        EgretArmatureDisplay._clockHandler = function (time) {
            var passedTime = time - EgretArmatureDisplay._clock.time;
            EgretArmatureDisplay._clock.advanceTime(passedTime * 0.001);
            EgretArmatureDisplay._clock.time = time;
            return false;
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            this.advanceTimeBySelf(false);
            this._armature = null;
        };
        /**
         * @inheritDoc
         */
        p._dispatchEvent = function (eventObject) {
            var event = egret.Event.create(EgretEvent, eventObject.type);
            event.data = eventObject;
            this.dispatchEvent(event);
            egret.Event.release(event);
        };
        /**
         * @inheritDoc
         */
        p.advanceTime = function (passedTime) {
            this._armature.advanceTime(passedTime);
        };
        /**
         * @inheritDoc
         */
        p.hasEvent = function (type) {
            return this.hasEventListener(type);
        };
        /**
         * @inheritDoc
         */
        p.addEvent = function (type, listener, target) {
            this.addEventListener(type, listener, target);
        };
        /**
         * @inheritDoc
         */
        p.removeEvent = function (type, listener, target) {
            this.removeEventListener(type, listener, target);
        };
        /**
         * @inheritDoc
         */
        p.advanceTimeBySelf = function (on) {
            if (on) {
                EgretArmatureDisplay._clock.add(this._armature);
            }
            else {
                EgretArmatureDisplay._clock.remove(this._armature);
            }
        };
        /**
         * @inheritDoc
         */
        p.dispose = function () {
            if (this._armature) {
                this._armature.dispose();
            }
        };
        d(p, "armature"
            /**
             * @inheritDoc
             */
            ,function () {
                return this._armature;
            }
        );
        d(p, "animation"
            /**
             * @inheritDoc
             */
            ,function () {
                return this._armature.animation;
            }
        );
        EgretArmatureDisplay._clock = null;
        return EgretArmatureDisplay;
    }(egret.DisplayObjectContainer));
    dragonBones.EgretArmatureDisplay = EgretArmatureDisplay;
    egret.registerClass(EgretArmatureDisplay,'dragonBones.EgretArmatureDisplay',["dragonBones.IArmatureDisplay","dragonBones.IEventDispatcher"]);
    /**
     * @deprecated
     * @see dragonBones.EgretEvent
     */
    var AnimationEvent = (function (_super) {
        __extends(AnimationEvent, _super);
        function AnimationEvent() {
            _super.apply(this, arguments);
        }
        var d = __define,c=AnimationEvent,p=c.prototype;
        return AnimationEvent;
    }(EgretEvent));
    dragonBones.AnimationEvent = AnimationEvent;
    egret.registerClass(AnimationEvent,'dragonBones.AnimationEvent');
    /**
     * @deprecated
     * @see dragonBones.EgretEvent
     */
    var FrameEvent = (function (_super) {
        __extends(FrameEvent, _super);
        function FrameEvent() {
            _super.apply(this, arguments);
        }
        var d = __define,c=FrameEvent,p=c.prototype;
        return FrameEvent;
    }(EgretEvent));
    dragonBones.FrameEvent = FrameEvent;
    egret.registerClass(FrameEvent,'dragonBones.FrameEvent');
    /**
     * @deprecated
     * @see dragonBones.EgretEvent
     */
    var SoundEvent = (function (_super) {
        __extends(SoundEvent, _super);
        function SoundEvent() {
            _super.apply(this, arguments);
        }
        var d = __define,c=SoundEvent,p=c.prototype;
        return SoundEvent;
    }(EgretEvent));
    dragonBones.SoundEvent = SoundEvent;
    egret.registerClass(SoundEvent,'dragonBones.SoundEvent');
    /**
     * @deprecated
     * @see dragonBones.EgretTextureAtlasData
     */
    var EgretTextureAtlas = (function (_super) {
        __extends(EgretTextureAtlas, _super);
        function EgretTextureAtlas(texture, rawData, scale) {
            if (scale === void 0) { scale = 1; }
            _super.call(this);
            this._onClear();
            this.texture = texture;
            dragonBones.ObjectDataParser.getInstance().parseTextureAtlasData(rawData, this, scale);
        }
        var d = __define,c=EgretTextureAtlas,p=c.prototype;
        /**
         * @private
         */
        EgretTextureAtlas.toString = function () {
            return "[Class dragonBones.EgretTextureAtlas]";
        };
        return EgretTextureAtlas;
    }(dragonBones.EgretTextureAtlasData));
    dragonBones.EgretTextureAtlas = EgretTextureAtlas;
    egret.registerClass(EgretTextureAtlas,'dragonBones.EgretTextureAtlas');
    /**
     * @deprecated
     * @see dragonBones.EgretTextureAtlasData
     */
    var EgretSheetAtlas = (function (_super) {
        __extends(EgretSheetAtlas, _super);
        function EgretSheetAtlas() {
            _super.apply(this, arguments);
        }
        var d = __define,c=EgretSheetAtlas,p=c.prototype;
        return EgretSheetAtlas;
    }(EgretTextureAtlas));
    dragonBones.EgretSheetAtlas = EgretSheetAtlas;
    egret.registerClass(EgretSheetAtlas,'dragonBones.EgretSheetAtlas');
    /**
     * @deprecated
     * @see dragonBones.EgretFactory#soundEventManater
     */
    var SoundEventManager = (function () {
        function SoundEventManager() {
        }
        var d = __define,c=SoundEventManager,p=c.prototype;
        /**
         * @deprecated
         * @see dragonBones.EgretFactory#soundEventManater
         */
        SoundEventManager.getInstance = function () {
            return dragonBones.Armature._soundEventManager;
        };
        return SoundEventManager;
    }());
    dragonBones.SoundEventManager = SoundEventManager;
    egret.registerClass(SoundEventManager,'dragonBones.SoundEventManager');
    /**
     * @deprecated
     * @see dragonBones.Armature#cacheFrameRate
     * @see dragonBones.Armature#enableAnimationCache()
     */
    var AnimationCacheManager = (function () {
        function AnimationCacheManager() {
        }
        var d = __define,c=AnimationCacheManager,p=c.prototype;
        return AnimationCacheManager;
    }());
    dragonBones.AnimationCacheManager = AnimationCacheManager;
    egret.registerClass(AnimationCacheManager,'dragonBones.AnimationCacheManager');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var ColorTransform = (function () {
        function ColorTransform(alphaMultiplier, redMultiplier, greenMultiplier, blueMultiplier, alphaOffset, redOffset, greenOffset, blueOffset) {
            if (alphaMultiplier === void 0) { alphaMultiplier = 1; }
            if (redMultiplier === void 0) { redMultiplier = 1; }
            if (greenMultiplier === void 0) { greenMultiplier = 1; }
            if (blueMultiplier === void 0) { blueMultiplier = 1; }
            if (alphaOffset === void 0) { alphaOffset = 0; }
            if (redOffset === void 0) { redOffset = 0; }
            if (greenOffset === void 0) { greenOffset = 0; }
            if (blueOffset === void 0) { blueOffset = 0; }
            this.alphaMultiplier = alphaMultiplier;
            this.redMultiplier = redMultiplier;
            this.greenMultiplier = greenMultiplier;
            this.blueMultiplier = blueMultiplier;
            this.alphaOffset = alphaOffset;
            this.redOffset = redOffset;
            this.greenOffset = greenOffset;
            this.blueOffset = blueOffset;
        }
        var d = __define,c=ColorTransform,p=c.prototype;
        p.copyFrom = function (value) {
            var self = this;
            self.alphaMultiplier = value.alphaMultiplier;
            self.redMultiplier = value.redMultiplier;
            self.greenMultiplier = value.greenMultiplier;
            self.blueMultiplier = value.blueMultiplier;
            self.alphaOffset = value.alphaOffset;
            self.redOffset = value.redOffset;
            self.redOffset = value.redOffset;
            self.greenOffset = value.blueOffset;
        };
        p.identity = function () {
            var self = this;
            self.alphaMultiplier = self.redMultiplier = self.greenMultiplier = self.blueMultiplier = 1;
            self.alphaOffset = self.redOffset = self.greenOffset = self.blueOffset = 0;
        };
        return ColorTransform;
    }());
    dragonBones.ColorTransform = ColorTransform;
    egret.registerClass(ColorTransform,'dragonBones.ColorTransform');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 生成骨架的基础工厂。
     * @see dragonBones.DragonBonesData
     * @see dragonBones.TextureAtlasData
     * @see dragonBones.ArmatureData
     * @see dragonBones.Armature
     * @version DragonBones 3.0
     */
    var BaseFactory = (function () {
        /**
         * @private
         */
        function BaseFactory() {
            /**
             * @language zh_CN
             * 是否开启共享搜索。 [true: 开启, false: 不开启]
             * 如果开启，创建一个骨架时，可以从多个龙骨数据中寻找骨架数据，或贴图集数据中寻找贴图数据。 (通常在有共享导出的数据时开启)
             * @see dragonBones.DragonBonesData#autoSearch
             * @see dragonBones.TextureAtlasData#autoSearch
             * @version DragonBones 4.5
             */
            this.autoSearch = false;
            /**
             * @private
             */
            this._objectDataParser = new dragonBones.ObjectDataParser();
            /**
             * @private
             */
            this._dragonBonesDataMap = {};
            /**
             * @private
             */
            this._textureAtlasDataMap = {};
        }
        var d = __define,c=BaseFactory,p=c.prototype;
        /**
         * @private
         */
        p._getTextureData = function (dragonBonesName, textureName) {
            var textureAtlasDataList = this._textureAtlasDataMap[dragonBonesName];
            if (textureAtlasDataList) {
                for (var i = 0, l = textureAtlasDataList.length; i < l; ++i) {
                    var textureData = textureAtlasDataList[i].getTextureData(textureName);
                    if (textureData) {
                        return textureData;
                    }
                }
            }
            if (this.autoSearch) {
                for (var i in this._textureAtlasDataMap) {
                    textureAtlasDataList = this._textureAtlasDataMap[i];
                    for (var j = 0, lJ = textureAtlasDataList.length; j < lJ; ++j) {
                        var textureAtlasData = textureAtlasDataList[j];
                        if (textureAtlasData.autoSearch) {
                            var textureData = textureAtlasData.getTextureData(textureName);
                            if (textureData) {
                                return textureData;
                            }
                        }
                    }
                }
            }
            return null;
        };
        /**
         * @private
         */
        p._fillBuildArmaturePackage = function (dragonBonesName, armatureName, skinName, dataPackage) {
            if (dragonBonesName) {
                var dragonBonesData = this._dragonBonesDataMap[dragonBonesName];
                if (dragonBonesData) {
                    var armatureData = dragonBonesData.getArmature(armatureName);
                    if (armatureData) {
                        dataPackage.dataName = dragonBonesName;
                        dataPackage.data = dragonBonesData;
                        dataPackage.armature = armatureData;
                        dataPackage.skin = armatureData.getSkin(skinName);
                        if (!dataPackage.skin) {
                            dataPackage.skin = armatureData.defaultSkin;
                        }
                        return true;
                    }
                }
            }
            if (!dragonBonesName || this.autoSearch) {
                for (var eachDragonBonesName in this._dragonBonesDataMap) {
                    var dragonBonesData = this._dragonBonesDataMap[eachDragonBonesName];
                    if (!dragonBonesName || dragonBonesData.autoSearch) {
                        var armatureData = dragonBonesData.getArmature(armatureName);
                        if (armatureData) {
                            dataPackage.dataName = eachDragonBonesName;
                            dataPackage.data = dragonBonesData;
                            dataPackage.armature = armatureData;
                            dataPackage.skin = armatureData.getSkin(skinName);
                            if (!dataPackage.skin) {
                                dataPackage.skin = armatureData.defaultSkin;
                            }
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        /**
         * @private
         */
        p._buildBones = function (dataPackage, armature) {
            var bones = dataPackage.armature.sortedBones;
            for (var i = 0, l = bones.length; i < l; ++i) {
                var boneData = bones[i];
                var bone = dragonBones.BaseObject.borrowObject(dragonBones.Bone);
                bone.name = boneData.name;
                bone.inheritTranslation = boneData.inheritTranslation;
                bone.inheritRotation = boneData.inheritRotation;
                bone.inheritScale = boneData.inheritScale;
                bone.length = boneData.length;
                bone.origin.copyFrom(boneData.transform);
                if (boneData.parent) {
                    armature.addBone(bone, boneData.parent.name);
                }
                else {
                    armature.addBone(bone);
                }
                if (boneData.ik) {
                    bone.ikBendPositive = boneData.bendPositive;
                    bone.ikWeight = boneData.weight;
                    bone._setIK(armature.getBone(boneData.ik.name), boneData.chain, boneData.chainIndex);
                }
            }
        };
        /**
         * @private
         */
        p._buildSlots = function (dataPackage, armature) {
            var currentSkin = dataPackage.skin;
            var defaultSkin = dataPackage.armature.defaultSkin;
            var slotDisplayDataSetMap = {};
            for (var i in defaultSkin.slots) {
                var slotDisplayDataSet = defaultSkin.slots[i];
                slotDisplayDataSetMap[slotDisplayDataSet.slot.name] = slotDisplayDataSet;
            }
            if (currentSkin != defaultSkin) {
                for (var i in currentSkin.slots) {
                    var slotDisplayDataSet = currentSkin.slots[i];
                    slotDisplayDataSetMap[slotDisplayDataSet.slot.name] = slotDisplayDataSet;
                }
            }
            var slots = dataPackage.armature.sortedSlots;
            for (var i = 0, l = slots.length; i < l; ++i) {
                var slotData = slots[i];
                var slotDisplayDataSet = slotDisplayDataSetMap[slotData.name];
                if (!slotDisplayDataSet) {
                    continue;
                }
                var slot = this._generateSlot(dataPackage, slotDisplayDataSet);
                slot._displayDataSet = slotDisplayDataSet;
                slot._setDisplayIndex(slotData.displayIndex);
                slot._setBlendMode(slotData.blendMode);
                slot._setColor(slotData.color);
                slot._replacedDisplayDataSet.length = slot._displayDataSet.displays.length;
                armature.addSlot(slot, slotData.parent.name);
            }
        };
        /**
         * @private
         */
        p._replaceSlotDisplay = function (dataPackage, displayData, slot, displayIndex) {
            if (displayIndex < 0) {
                displayIndex = slot.displayIndex;
            }
            if (displayIndex >= 0) {
                var displayList = slot.displayList; // Copy.
                if (displayList.length <= displayIndex) {
                    displayList.length = displayIndex + 1;
                }
                if (!displayData.textureData) {
                    displayData.textureData = this._getTextureData(dataPackage.dataName, displayData.name);
                }
                if (displayData.type == 1 /* Armature */) {
                    var childArmature = this.buildArmature(displayData.name, dataPackage.dataName);
                    displayList[displayIndex] = childArmature;
                }
                else {
                    if (slot._replacedDisplayDataSet.length <= displayIndex) {
                        slot._replacedDisplayDataSet.length = displayIndex + 1;
                    }
                    slot._replacedDisplayDataSet[displayIndex] = displayData;
                    if (displayData.meshData) {
                        displayList[displayIndex] = slot.MeshDisplay;
                    }
                    else {
                        displayList[displayIndex] = slot.rawDisplay;
                    }
                }
                slot.displayList = displayList;
                slot.invalidUpdate();
            }
        };
        /**
         * @language zh_CN
         * 解析并添加龙骨数据。
         * @param rawData 需要解析的原始数据。 (JSON)
         * @param dragonBonesName 为数据提供一个名称，以便可以通过这个名称来获取数据，状态，则使用数据中的名称。
         * @returns DragonBonesData
         * @see #getDragonBonesData()
         * @see #addDragonBonesData()
         * @see #removeDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 4.5
         */
        p.parseDragonBonesData = function (rawData, dragonBonesName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            var dragonBonesData = this._objectDataParser.parseDragonBonesData(rawData);
            this.addDragonBonesData(dragonBonesData, dragonBonesName);
            return dragonBonesData;
        };
        /**
         * @language zh_CN
         * 解析并添加贴图集数据。
         * @param rawData 需要解析的原始数据。 (JSON)
         * @param textureAtlas 贴图集数据。 (JSON)
         * @param name 为数据指定一个名称，以便可以通过这个名称来访问数据，如果未设置，则使用数据中的名称。
         * @param scale 为贴图集设置一个缩放值。
         * @returns 贴图集数据
         * @see #getTextureAtlasData()
         * @see #addTextureAtlasData()
         * @see #removeTextureAtlasData()
         * @see dragonBones.TextureAtlasData
         * @version DragonBones 4.5
         */
        p.parseTextureAtlasData = function (rawData, textureAtlas, name, scale) {
            if (name === void 0) { name = null; }
            if (scale === void 0) { scale = 0; }
            var textureAtlasData = this._generateTextureAtlasData(null, null);
            this._objectDataParser.parseTextureAtlasData(rawData, textureAtlasData, scale);
            this._generateTextureAtlasData(textureAtlasData, textureAtlas);
            this.addTextureAtlasData(textureAtlasData, name);
            return textureAtlasData;
        };
        /**
         * @language zh_CN
         * 获取指定名称的龙骨数据。
         * @param name 数据名称。
         * @returns DragonBonesData
         * @see #parseDragonBonesData()
         * @see #addDragonBonesData()
         * @see #removeDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 3.0
         */
        p.getDragonBonesData = function (name) {
            return this._dragonBonesDataMap[name];
        };
        /**
         * @language zh_CN
         * 添加龙骨数据。
         * @param data 龙骨数据。
         * @param dragonBonesName 为数据指定一个名称，以便可以通过这个名称来访问数据，如果未设置，则使用数据中的名称。
         * @see #parseDragonBonesData()
         * @see #getDragonBonesData()
         * @see #removeDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 3.0
         */
        p.addDragonBonesData = function (data, dragonBonesName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            if (data) {
                dragonBonesName = dragonBonesName || data.name;
                if (dragonBonesName) {
                    if (!this._dragonBonesDataMap[dragonBonesName]) {
                        this._dragonBonesDataMap[dragonBonesName] = data;
                    }
                    else {
                        console.warn("Same name data.");
                    }
                }
                else {
                    console.warn("Unnamed data.");
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * @language zh_CN
         * 移除龙骨数据。
         * @param dragonBonesName 数据名称。
         * @param disposeData 是否释放数据。 [false: 不释放, true: 释放]
         * @see #parseDragonBonesData()
         * @see #getDragonBonesData()
         * @see #addDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 3.0
         */
        p.removeDragonBonesData = function (dragonBonesName, disposeData) {
            if (disposeData === void 0) { disposeData = true; }
            var dragonBonesData = this._dragonBonesDataMap[dragonBonesName];
            if (dragonBonesData) {
                if (disposeData) {
                    if (dragonBones.DragonBones.DEBUG) {
                        for (var i = 0, l = dragonBones.DragonBones._armatures.length; i < l; ++i) {
                            var armature = dragonBones.DragonBones._armatures[i];
                            if (armature.armatureData.parent == dragonBonesData) {
                                throw new Error("ArmatureData: " + armature.armatureData.name + " DragonBonesData: " + dragonBonesName);
                            }
                        }
                    }
                    dragonBonesData.returnToPool();
                }
                delete this._dragonBonesDataMap[dragonBonesName];
            }
        };
        /**
         * @language zh_CN
         * 获取指定名称的贴图集数据列表。
         * @param dragonBonesName 数据名称。
         * @returns 贴图集数据列表。
         * @see #parseTextureAtlasData()
         * @see #addTextureAtlasData()
         * @see #removeTextureAtlasData()
         * @see dragonBones.textures.TextureAtlasData
         * @version DragonBones 3.0
         */
        p.getTextureAtlasData = function (dragonBonesName) {
            return this._textureAtlasDataMap[dragonBonesName];
        };
        /**
         * @language zh_CN
         * 添加贴图集数据。
         * @param data 贴图集数据。
         * @param dragonBonesName 为数据指定一个名称，以便可以通过这个名称来访问数据，如果未设置，则使用数据中的名称。
         * @see #parseTextureAtlasData()
         * @see #getTextureAtlasData()
         * @see #removeTextureAtlasData()
         * @see dragonBones.textures.TextureAtlasData
         * @version DragonBones 3.0
         */
        p.addTextureAtlasData = function (data, dragonBonesName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            if (data) {
                dragonBonesName = dragonBonesName || data.name;
                if (dragonBonesName) {
                    var textureAtlasList = this._textureAtlasDataMap[dragonBonesName] = this._textureAtlasDataMap[dragonBonesName] || [];
                    if (textureAtlasList.indexOf(data) < 0) {
                        textureAtlasList.push(data);
                    }
                }
                else {
                    console.warn("Unnamed data.");
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * @language zh_CN
         * 移除贴图集数据。
         * @param dragonBonesName 数据名称。
         * @param disposeData 是否释放数据。 [false: 不释放, true: 释放]
         * @see #parseTextureAtlasData()
         * @see #getTextureAtlasData()
         * @see #addTextureAtlasData()
         * @see dragonBones.textures.TextureAtlasData
         * @version DragonBones 3.0
         */
        p.removeTextureAtlasData = function (dragonBonesName, disposeData) {
            if (disposeData === void 0) { disposeData = true; }
            var textureAtlasDataList = this._textureAtlasDataMap[dragonBonesName];
            if (textureAtlasDataList) {
                if (disposeData) {
                    for (var i = 0, l = textureAtlasDataList.length; i < l; ++i) {
                        textureAtlasDataList[i].returnToPool();
                    }
                }
                delete this._textureAtlasDataMap[dragonBonesName];
            }
        };
        /**
         * @language zh_CN
         * 清除所有的数据。
         * @param disposeData 是否释放数据。 [false: 不释放, true: 释放]
         * @version DragonBones 4.5
         */
        p.clear = function (disposeData) {
            if (disposeData === void 0) { disposeData = true; }
            var self = this;
            for (var i in self._dragonBonesDataMap) {
                if (disposeData) {
                    self._dragonBonesDataMap[i].returnToPool();
                }
                delete self._dragonBonesDataMap[i];
            }
            for (var i in self._textureAtlasDataMap) {
                if (disposeData) {
                    var textureAtlasDataList = self._textureAtlasDataMap[i];
                    for (var i_2 = 0, l = textureAtlasDataList.length; i_2 < l; ++i_2) {
                        textureAtlasDataList[i_2].returnToPool();
                    }
                }
                delete self._textureAtlasDataMap[i];
            }
        };
        /**
         * @language zh_CN
         * 创建一个指定名称的骨架。
         * @param armatureName 骨架数据名称。
         * @param dragonBonesName 龙骨数据名称，如果未设置，将检索所有的龙骨数据，当多个龙骨数据中包含同名的骨架数据时，可能无法创建出准确的骨架。
         * @param skinName 皮肤名称，如果未设置，则使用默认皮肤。
         * @returns 骨架
         * @see dragonBones.Armature
         * @version DragonBones 3.0
         */
        p.buildArmature = function (armatureName, dragonBonesName, skinName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            if (skinName === void 0) { skinName = null; }
            var dataPackage = {};
            if (this._fillBuildArmaturePackage(dragonBonesName, armatureName, skinName, dataPackage)) {
                var armature = this._generateArmature(dataPackage);
                this._buildBones(dataPackage, armature);
                this._buildSlots(dataPackage, armature);
                if (armature.armatureData.actions.length > 0) {
                    armature._action = armature.armatureData.actions[armature.armatureData.actions.length - 1];
                }
                armature.advanceTime(0); // Update armature pose.
                return armature;
            }
            return null;
        };
        /**
         * @language zh_CN
         * 将指定骨架的动画替换成其他骨架的动画。 (通常这些骨架应该具有相同的骨架结构)
         * @param toArmature 指定的骨架。
         * @param fromArmatreName 其他骨架的名称。
         * @param fromSkinName 其他骨架的皮肤名称，如果未设置，则使用默认皮肤。
         * @param fromDragonBonesDataName 其他骨架属于的龙骨数据名称，如果未设置，则检索所有的龙骨数据。
         * @param ifRemoveOriginalAnimationList 是否移除原有的动画。 [true: 移除, false: 不移除]
         * @returns 是否替换成功。 [true: 成功, false: 不成功]
         * @see dragonBones.Armature
         * @version DragonBones 4.5
         */
        p.copyAnimationsToArmature = function (toArmature, fromArmatreName, fromSkinName, fromDragonBonesDataName, ifRemoveOriginalAnimationList) {
            if (fromSkinName === void 0) { fromSkinName = null; }
            if (fromDragonBonesDataName === void 0) { fromDragonBonesDataName = null; }
            if (ifRemoveOriginalAnimationList === void 0) { ifRemoveOriginalAnimationList = true; }
            var dataPackage = {};
            if (this._fillBuildArmaturePackage(fromDragonBonesDataName, fromArmatreName, fromSkinName, dataPackage)) {
                var fromArmatureData = dataPackage.armature;
                if (ifRemoveOriginalAnimationList) {
                    toArmature.animation.animations = fromArmatureData.animations;
                }
                else {
                    var animations = {};
                    for (var animationName in toArmature.animation.animations) {
                        animations[animationName] = toArmature.animation.animations[animationName];
                    }
                    for (var animationName in fromArmatureData.animations) {
                        animations[animationName] = fromArmatureData.animations[animationName];
                    }
                    toArmature.animation.animations = animations;
                }
                if (dataPackage.skin) {
                    var slots = toArmature.getSlots();
                    for (var i = 0, l = slots.length; i < l; ++i) {
                        var toSlot = slots[i];
                        var toSlotDisplayList = toSlot.displayList;
                        for (var i_3 = 0, l_2 = toSlotDisplayList.length; i_3 < l_2; ++i_3) {
                            var toDisplayObject = toSlotDisplayList[i_3];
                            if (toDisplayObject instanceof dragonBones.Armature) {
                                var displays = dataPackage.skin.getSlot(toSlot.name).displays;
                                if (i_3 < displays.length) {
                                    var fromDisplayData = displays[i_3];
                                    if (fromDisplayData.type == 1 /* Armature */) {
                                        this.copyAnimationsToArmature(toDisplayObject, fromDisplayData.name, fromSkinName, fromDragonBonesDataName, ifRemoveOriginalAnimationList);
                                    }
                                }
                            }
                        }
                    }
                    return true;
                }
            }
            return false;
        };
        /**
         * @language zh_CN
         * 将指定插槽的显示对象替换为指定资源创造出的显示对象。
         * @param dragonBonesName 指定的龙骨数据名称。
         * @param armatureName 指定的骨架名称。
         * @param slotName 指定的插槽名称。
         * @param displayName 指定的显示对象名称。
         * @param slot 指定的插槽实例。
         * @param displayIndex 要替换的显示对象的索引，如果未设置，则替换当前正在显示的显示对象。
         * @version DragonBones 4.5
         */
        p.replaceSlotDisplay = function (dragonBonesName, armatureName, slotName, displayName, slot, displayIndex) {
            if (displayIndex === void 0) { displayIndex = -1; }
            var dataPackage = {};
            if (this._fillBuildArmaturePackage(dragonBonesName, armatureName, null, dataPackage)) {
                var slotDisplayDataSet = dataPackage.skin.getSlot(slotName);
                if (slotDisplayDataSet) {
                    for (var i = 0, l = slotDisplayDataSet.displays.length; i < l; ++i) {
                        var displayData = slotDisplayDataSet.displays[i];
                        if (displayData.name == displayName) {
                            this._replaceSlotDisplay(dataPackage, displayData, slot, displayIndex);
                            break;
                        }
                    }
                }
            }
        };
        /**
         * @language zh_CN
         * 将指定插槽的显示对象列表替换为指定资源创造出的显示对象列表。
         * @param dragonBonesName 指定的 DragonBonesData 名称。
         * @param armatureName 指定的骨架名称。
         * @param slotName 指定的插槽名称。
         * @param slot 指定的插槽实例。
         * @version DragonBones 4.5
         */
        p.replaceSlotDisplayList = function (dragonBonesName, armatureName, slotName, slot) {
            var dataPackage = {};
            if (this._fillBuildArmaturePackage(dragonBonesName, armatureName, null, dataPackage)) {
                var slotDisplayDataSet = dataPackage.skin.getSlot(slotName);
                if (slotDisplayDataSet) {
                    var displayIndex = 0;
                    for (var i = 0, l = slotDisplayDataSet.displays.length; i < l; ++i) {
                        var displayData = slotDisplayDataSet.displays[i];
                        this._replaceSlotDisplay(dataPackage, displayData, slot, displayIndex++);
                    }
                }
            }
        };
        /**
         * @deprecated
         * @see #clear()
         */
        p.dispose = function () {
            this.clear();
        };
        return BaseFactory;
    }());
    dragonBones.BaseFactory = BaseFactory;
    egret.registerClass(BaseFactory,'dragonBones.BaseFactory');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * Egret 工厂。
     * @version DragonBones 3.0
     */
    var EgretFactory = (function (_super) {
        __extends(EgretFactory, _super);
        /**
         * @language zh_CN
         * 创建一个工厂。
         * @version DragonBones 3.0
         */
        function EgretFactory() {
            _super.call(this);
            if (!dragonBones.Armature._soundEventManager) {
                dragonBones.Armature._soundEventManager = new dragonBones.EgretArmatureDisplay();
            }
        }
        var d = __define,c=EgretFactory,p=c.prototype;
        /**
         * @private
         */
        p._generateTextureAtlasData = function (textureAtlasData, textureAtlas) {
            if (textureAtlasData) {
                textureAtlasData.texture = textureAtlas;
            }
            else {
                textureAtlasData = dragonBones.BaseObject.borrowObject(dragonBones.EgretTextureAtlasData);
            }
            return textureAtlasData;
        };
        /**
         * @private
         */
        p._generateArmature = function (dataPackage) {
            var armature = dragonBones.BaseObject.borrowObject(dragonBones.Armature);
            var armatureDisplayContainer = new dragonBones.EgretArmatureDisplay();
            armature._armatureData = dataPackage.armature;
            armature._skinData = dataPackage.skin;
            armature._animation = dragonBones.BaseObject.borrowObject(dragonBones.Animation);
            armature._display = armatureDisplayContainer;
            armatureDisplayContainer._armature = armature;
            armature._animation._armature = armature;
            armature.animation.animations = dataPackage.armature.animations;
            return armature;
        };
        /**
         * @private
         */
        p._generateSlot = function (dataPackage, slotDisplayDataSet) {
            var slot = dragonBones.BaseObject.borrowObject(dragonBones.EgretSlot);
            var slotData = slotDisplayDataSet.slot;
            var displayList = [];
            slot.name = slotData.name;
            slot._rawDisplay = new egret.Bitmap();
            for (var i = 0, l = slotDisplayDataSet.displays.length; i < l; ++i) {
                var displayData = slotDisplayDataSet.displays[i];
                switch (displayData.type) {
                    case 0 /* Image */:
                        if (!displayData.textureData) {
                            displayData.textureData = this._getTextureData(dataPackage.dataName, displayData.name);
                        }
                        displayList.push(slot._rawDisplay);
                        break;
                    case 2 /* Mesh */:
                        if (!displayData.textureData) {
                            displayData.textureData = this._getTextureData(dataPackage.dataName, displayData.name);
                        }
                        if (egret.Capabilities.renderMode == "webgl") {
                            if (!slot._meshDisplay) {
                                slot._meshDisplay = new egret.Mesh();
                            }
                            displayList.push(slot._meshDisplay);
                        }
                        else {
                            displayList.push(slot._rawDisplay);
                        }
                        break;
                    case 1 /* Armature */:
                        var childArmature = this.buildArmature(displayData.name, dataPackage.dataName);
                        if (childArmature) {
                            if (slotData.actions.length > 0) {
                                childArmature._action = slotData.actions[slotData.actions.length - 1];
                            }
                            else {
                                childArmature.animation.play();
                            }
                        }
                        displayList.push(childArmature);
                        break;
                    default:
                        displayList.push(null);
                        break;
                }
            }
            slot._setDisplayList(displayList);
            return slot;
        };
        /**
         * @language zh_CN
         * 创建一个指定名称的骨架，并使用骨架的显示容器来更新骨架动画。
         * @param armatureName 骨架数据名称。
         * @param dragonBonesName 龙骨数据名称，如果未设置，将检索所有的龙骨数据，如果多个数据中包含同名的骨架数据，可能无法创建出准确的骨架。
         * @param skinName 皮肤名称，如果未设置，则使用默认皮肤。
         * @returns 骨架的显示容器。
         * @see dragonBones.IArmatureDisplayContainer
         * @version DragonBones 4.5
         */
        p.buildArmatureDisplay = function (armatureName, dragonBonesName, skinName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            if (skinName === void 0) { skinName = null; }
            var armature = this.buildArmature(armatureName, dragonBonesName, skinName);
            var armatureDisplay = armature ? armature._display : null;
            if (armatureDisplay) {
                armatureDisplay.advanceTimeBySelf(true);
            }
            return armatureDisplay;
        };
        /**
         * @language zh_CN
         * 获取带有指定贴图的显示对象。
         * @param textureName 指定的贴图名称。
         * @param dragonBonesName 指定的龙骨数据名称，如果未设置，将检索所有的龙骨数据。
         * @version DragonBones 3.0
         */
        p.getTextureDisplay = function (textureName, dragonBonesName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            var textureData = this._getTextureData(dragonBonesName, textureName);
            if (textureData) {
                return new egret.Bitmap(textureData.texture);
            }
            return null;
        };
        d(p, "soundEventManater"
            /**
             * @language zh_CN
             * 获取全局声音事件管理器。
             * @version DragonBones 4.5
             */
            ,function () {
                return dragonBones.Armature._soundEventManager;
            }
        );
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#addDragonBonesData()
         */
        p.addSkeletonData = function (dragonBonesData, dragonBonesName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            this.addDragonBonesData(dragonBonesData, dragonBonesName);
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#getDragonBonesData()
         */
        p.getSkeletonData = function (dragonBonesName) {
            return this.getDragonBonesData(dragonBonesName);
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#removeSkeletonData()
         */
        p.removeSkeletonData = function (dragonBonesName) {
            this.removeDragonBonesData(dragonBonesName);
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#addTextureAtlasData()
         */
        p.addTextureAtlas = function (textureAtlasData, dragonBonesName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            this.addTextureAtlasData(textureAtlasData, dragonBonesName);
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#getTextureAtlasData()
         */
        p.getTextureAtlas = function (dragonBonesName) {
            return this.getTextureAtlasData(dragonBonesName);
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#removeTextureAtlasData()
         */
        p.removeTextureAtlas = function (dragonBonesName) {
            this.removeTextureAtlasData(dragonBonesName);
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#buildArmature()
         */
        p.buildFastArmature = function (armatureName, dragonBonesName, skinName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            if (skinName === void 0) { skinName = null; }
            return this.buildArmature(armatureName, dragonBonesName, skinName);
        };
        return EgretFactory;
    }(dragonBones.BaseFactory));
    dragonBones.EgretFactory = EgretFactory;
    egret.registerClass(EgretFactory,'dragonBones.EgretFactory');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * Egret 插槽。
     * @version DragonBones 3.0
     */
    var EgretSlot = (function (_super) {
        __extends(EgretSlot, _super);
        /**
         * @language zh_CN
         * 创建一个空的插槽。
         * @version DragonBones 3.0
         */
        function EgretSlot() {
            _super.call(this);
        }
        var d = __define,c=EgretSlot,p=c.prototype;
        /**
         * @private
         */
        EgretSlot.toString = function () {
            return "[Class dragonBones.EgretSlot]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            _super.prototype._onClear.call(this);
            this.transformUpdateEnabled = false;
            this._renderDisplay = null;
            this._colorFilter = null;
        };
        /**
         * @private
         */
        p._onUpdateDisplay = function () {
            var self = this;
            if (!self._rawDisplay) {
                self._rawDisplay = new egret.Bitmap();
            }
            self._renderDisplay = (self._display || self._rawDisplay);
        };
        /**
         * @private
         */
        p._initDisplay = function (value) {
        };
        /**
         * @private
         */
        p._addDisplay = function () {
            var container = this._armature._display;
            container.addChild(this._renderDisplay);
        };
        /**
         * @private
         */
        p._replaceDisplay = function (value) {
            var container = this._armature._display;
            var prevDisplay = value;
            container.addChild(this._renderDisplay);
            container.swapChildren(this._renderDisplay, prevDisplay);
            container.removeChild(prevDisplay);
        };
        /**
         * @private
         */
        p._removeDisplay = function () {
            this._renderDisplay.parent.removeChild(this._renderDisplay);
        };
        /**
         * @private
         */
        p._disposeDisplay = function (value) {
        };
        /**
         * @private
         */
        p._updateVisible = function () {
            this._renderDisplay.visible = this._parent.visible;
        };
        /**
         * @private
         */
        p._updateBlendMode = function () {
            if (this._blendMode < EgretSlot.BLEND_MODE_LIST.length) {
                var blendMode = EgretSlot.BLEND_MODE_LIST[this._blendMode];
                if (blendMode) {
                    this._renderDisplay.blendMode = blendMode;
                }
            }
        };
        /**
         * @private
         */
        p._updateColor = function () {
            var self = this;
            if (self._colorTransform.redMultiplier != 1 ||
                self._colorTransform.greenMultiplier != 1 ||
                self._colorTransform.blueMultiplier != 1 ||
                self._colorTransform.redOffset != 0 ||
                self._colorTransform.greenOffset != 0 ||
                self._colorTransform.blueOffset != 0) {
                if (!self._colorFilter) {
                    self._colorFilter = new egret.ColorMatrixFilter();
                }
                var colorMatrix = self._colorFilter.matrix;
                colorMatrix[0] = self._colorTransform.redMultiplier;
                colorMatrix[6] = self._colorTransform.greenMultiplier;
                colorMatrix[12] = self._colorTransform.blueMultiplier;
                colorMatrix[18] = self._colorTransform.alphaMultiplier;
                colorMatrix[4] = self._colorTransform.redOffset;
                colorMatrix[9] = self._colorTransform.greenOffset;
                colorMatrix[14] = self._colorTransform.blueOffset;
                colorMatrix[19] = self._colorTransform.alphaOffset;
                self._colorFilter.matrix = colorMatrix;
                var filters = self._renderDisplay.filters;
                if (!filters) {
                    filters = [];
                }
                if (filters.indexOf(self._colorFilter) < 0) {
                    filters.push(self._colorFilter);
                }
                self._renderDisplay.filters = filters;
            }
            else {
                if (self._colorFilter) {
                    self._colorFilter = null;
                    self._renderDisplay.filters = null;
                }
                self._renderDisplay.$setAlpha(self._colorTransform.alphaMultiplier);
            }
        };
        /**
         * @private
         */
        p._updateFilters = function () { };
        /**
         * @private
         */
        p._updateFrame = function () {
            var self = this;
            var frameDisplay = self._renderDisplay;
            if (self._display && self._displayIndex >= 0) {
                var rawDisplayData = self._displayIndex < self._displayDataSet.displays.length ? self._displayDataSet.displays[self._displayIndex] : null;
                var replacedDisplayData = self._displayIndex < self._replacedDisplayDataSet.length ? self._replacedDisplayDataSet[self._displayIndex] : null;
                var currentDisplayData = replacedDisplayData || rawDisplayData;
                var currentTextureData = currentDisplayData.textureData;
                if (currentTextureData) {
                    var textureAtlasTexture = currentTextureData.parent.texture;
                    if (!currentTextureData.texture && textureAtlasTexture) {
                        currentTextureData.texture = new egret.Texture();
                        currentTextureData.texture._bitmapData = textureAtlasTexture._bitmapData;
                        currentTextureData.texture.$initData(currentTextureData.region.x, currentTextureData.region.y, currentTextureData.region.width, currentTextureData.region.height, 0, 0, currentTextureData.region.width, currentTextureData.region.height, textureAtlasTexture.textureWidth, textureAtlasTexture.textureHeight);
                    }
                    var texture = self._armature._replacedTexture || currentTextureData.texture;
                    if (texture) {
                        if (self._meshData && self._display == self._meshDisplay) {
                            var meshDisplay = self._meshDisplay;
                            var meshNode = meshDisplay.$renderNode;
                            for (var i = 0, l = self._meshData.vertices.length; i < l; ++i) {
                                meshNode.uvs[i] = self._meshData.uvs[i];
                                meshNode.vertices[i] = self._meshData.vertices[i];
                            }
                            for (var i = 0, l = self._meshData.vertexIndices.length; i < l; ++i) {
                                meshNode.indices[i] = self._meshData.vertexIndices[i];
                            }
                            meshDisplay.$setBitmapData(texture);
                            meshDisplay.$updateVertices();
                            meshDisplay.$invalidateTransform();
                        }
                        else {
                            var rect = currentTextureData.frame || currentTextureData.region;
                            var width = rect.width;
                            var height = rect.height;
                            if (currentTextureData.rotated) {
                                width = rect.height;
                                height = rect.width;
                            }
                            var pivotX = currentDisplayData.pivot.x;
                            var pivotY = currentDisplayData.pivot.y;
                            if (currentDisplayData.isRelativePivot) {
                                pivotX = width * pivotX;
                                pivotY = height * pivotY;
                            }
                            if (currentTextureData.frame) {
                                pivotX += currentTextureData.frame.x;
                                pivotY += currentTextureData.frame.y;
                            }
                            if (rawDisplayData && replacedDisplayData) {
                                pivotX += rawDisplayData.transform.x - replacedDisplayData.transform.x;
                                pivotY += rawDisplayData.transform.y - replacedDisplayData.transform.y;
                            }
                            frameDisplay.$setBitmapData(texture);
                            frameDisplay.$setAnchorOffsetX(pivotX);
                            frameDisplay.$setAnchorOffsetY(pivotY);
                        }
                        self._updateVisible();
                        return;
                    }
                }
            }
            frameDisplay.visible = false;
            frameDisplay.$setBitmapData(null);
            frameDisplay.$setAnchorOffsetX(0);
            frameDisplay.$setAnchorOffsetY(0);
            frameDisplay.x = 0;
            frameDisplay.y = 0;
        };
        /**
         * @private
         */
        p._updateMesh = function () {
            var self = this;
            var meshDisplay = self._meshDisplay;
            var meshNode = meshDisplay.$renderNode;
            var hasFFD = self._ffdVertices.length > 0;
            if (self._meshData.skinned) {
                for (var i = 0, iF = 0, l = self._meshData.vertices.length; i < l; i += 2) {
                    var iH = i / 2;
                    var boneIndices = self._meshData.boneIndices[iH];
                    var boneVertices = self._meshData.boneVertices[iH];
                    var weights = self._meshData.weights[iH];
                    var xG = 0, yG = 0;
                    for (var iB = 0, lB = boneIndices.length; iB < lB; ++iB) {
                        var bone = self._meshBones[boneIndices[iB]];
                        var matrix = bone.globalTransformMatrix;
                        var weight = weights[iB];
                        var xL = 0, yL = 0;
                        if (hasFFD) {
                            xL = boneVertices[iB * 2] + self._ffdVertices[iF];
                            yL = boneVertices[iB * 2 + 1] + self._ffdVertices[iF + 1];
                        }
                        else {
                            xL = boneVertices[iB * 2];
                            yL = boneVertices[iB * 2 + 1];
                        }
                        xG += (matrix.a * xL + matrix.c * yL + matrix.tx) * weight;
                        yG += (matrix.b * xL + matrix.d * yL + matrix.ty) * weight;
                        iF += 2;
                    }
                    meshNode.vertices[i] = xG;
                    meshNode.vertices[i + 1] = yG;
                }
                meshDisplay.$updateVertices();
                meshDisplay.$invalidateTransform();
            }
            else if (hasFFD) {
                var vertices = self._meshData.vertices;
                for (var i = 0, l = self._meshData.vertices.length; i < l; i += 2) {
                    var xG = vertices[i] + self._ffdVertices[i];
                    var yG = vertices[i + 1] + self._ffdVertices[i + 1];
                    meshNode.vertices[i] = xG;
                    meshNode.vertices[i + 1] = yG;
                }
                meshDisplay.$updateVertices();
                meshDisplay.$invalidateTransform();
            }
        };
        /**
         * @private
         */
        p._updateTransform = function () {
            var self = this;
            self._renderDisplay.$setMatrix(self.globalTransformMatrix, self.transformUpdateEnabled);
        };
        /**
         * @private
         */
        EgretSlot.BLEND_MODE_LIST = [
            egret.BlendMode.NORMAL,
            egret.BlendMode.ADD,
            null,
            null,
            null,
            egret.BlendMode.ERASE,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        ];
        return EgretSlot;
    }(dragonBones.Slot));
    dragonBones.EgretSlot = EgretSlot;
    egret.registerClass(EgretSlot,'dragonBones.EgretSlot');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 2D 矩阵。
     * @version DragonBones 3.0
     */
    var Matrix = (function () {
        function Matrix(a, b, c, d, tx, ty) {
            if (a === void 0) { a = 1; }
            if (b === void 0) { b = 0; }
            if (c === void 0) { c = 0; }
            if (d === void 0) { d = 1; }
            if (tx === void 0) { tx = 0; }
            if (ty === void 0) { ty = 0; }
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }
        var d = __define,c=Matrix,p=c.prototype;
        /**
         * @language zh_CN
         * 复制矩阵。
         * @param value 需要复制的矩阵。
         * @version DragonBones 3.0
         */
        p.copyFrom = function (value) {
            var self = this;
            self.a = value.a;
            self.b = value.b;
            self.c = value.c;
            self.d = value.d;
            self.tx = value.tx;
            self.ty = value.ty;
        };
        /**
         * @language zh_CN
         * 转换为恒等矩阵。
         * @version DragonBones 3.0
         */
        p.identity = function () {
            var self = this;
            self.a = self.d = 1;
            self.b = self.c = 0;
            self.tx = self.ty = 0;
        };
        /**
         * @language zh_CN
         * 将当前矩阵与另一个矩阵相乘。
         * @param value 需要相乘的矩阵。
         * @version DragonBones 3.0
         */
        p.concat = function (value) {
            var self = this;
            var aA = self.a;
            var bA = self.b;
            var cA = self.c;
            var dA = self.d;
            var txA = self.tx;
            var tyA = self.ty;
            var aB = value.a;
            var bB = value.b;
            var cB = value.c;
            var dB = value.d;
            var txB = value.tx;
            var tyB = value.ty;
            self.a = aA * aB + bA * cB;
            self.b = aA * bB + bA * dB;
            self.c = cA * aB + dA * cB;
            self.d = cA * bB + dA * dB;
            self.tx = aB * txA + cB * tyA + txB;
            self.ty = dB * tyA + bB * txA + tyB;
            /*
            [
                self.a,
                self.b,
                self.c,
                self.d,
                self.tx,
                self.ty
            ] = [
                self.a * value.a + self.b * value.c,
                self.a * value.b + self.b * value.d,
                self.c * value.a + self.d * value.c,
                self.c * value.b + self.d * value.d,
                value.a * self.tx + value.c * self.tx + value.tx,
                value.d * self.ty + value.b * self.ty + value.ty
            ];
            */
        };
        /**
         * @language zh_CN
         * 转换为逆矩阵。
         * @version DragonBones 3.0
         */
        p.invert = function () {
            var self = this;
            var aA = self.a;
            var bA = self.b;
            var cA = self.c;
            var dA = self.d;
            var txA = self.tx;
            var tyA = self.ty;
            var n = aA * dA - bA * cA;
            self.a = dA / n;
            self.b = -bA / n;
            self.c = -cA / n;
            self.d = aA / n;
            self.tx = (cA * tyA - dA * txA) / n;
            self.ty = -(aA * tyA - bA * txA) / n;
        };
        /**
         * @language zh_CN
         * 将矩阵转换应用于指定点。
         * @param x 横坐标。
         * @param y 纵坐标。
         * @param result 应用转换之后的坐标。
         * @params delta 是否忽略 tx，ty 对坐标的转换。
         * @version DragonBones 3.0
         */
        p.transformPoint = function (x, y, result, delta) {
            if (delta === void 0) { delta = false; }
            var self = this;
            result.x = self.a * x + self.c * y;
            result.y = self.b * x + self.d * y;
            if (!delta) {
                result.x += self.tx;
                result.y += self.ty;
            }
        };
        return Matrix;
    }());
    dragonBones.Matrix = Matrix;
    egret.registerClass(Matrix,'dragonBones.Matrix');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var Point = (function () {
        function Point(x, y) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            this.x = x;
            this.y = y;
        }
        var d = __define,c=Point,p=c.prototype;
        p.copyFrom = function (value) {
            this.x = value.x;
            this.y = value.y;
        };
        p.clear = function () {
            this.x = this.y = 0;
        };
        return Point;
    }());
    dragonBones.Point = Point;
    egret.registerClass(Point,'dragonBones.Point');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var Rectangle = (function () {
        function Rectangle(x, y, width, height) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        var d = __define,c=Rectangle,p=c.prototype;
        p.copyFrom = function (value) {
            this.x = value.x;
            this.y = value.y;
            this.width = value.width;
            this.height = value.height;
        };
        p.clear = function () {
            this.x = this.y = 0;
            this.width = this.height = 0;
        };
        return Rectangle;
    }());
    dragonBones.Rectangle = Rectangle;
    egret.registerClass(Rectangle,'dragonBones.Rectangle');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 2D 变换。
     * @version DragonBones 3.0
     */
    var Transform = (function () {
        /**
         * @private
         */
        function Transform(
            /**
             * @language zh_CN
             * 水平位移。
             * @version DragonBones 3.0
             */
            x, 
            /**
             * @language zh_CN
             * 垂直位移。
             * @version DragonBones 3.0
             */
            y, 
            /**
             * @language zh_CN
             * 水平倾斜。 (以弧度为单位)
             * @version DragonBones 3.0
             */
            skewX, 
            /**
             * @language zh_CN
             * 垂直倾斜。 (以弧度为单位)
             * @version DragonBones 3.0
             */
            skewY, 
            /**
             * @language zh_CN
             * 水平缩放。
             * @version DragonBones 3.0
             */
            scaleX, 
            /**
             * @language zh_CN
             * 垂直缩放。
             * @version DragonBones 3.0
             */
            scaleY) {
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (skewX === void 0) { skewX = 0; }
            if (skewY === void 0) { skewY = 0; }
            if (scaleX === void 0) { scaleX = 1; }
            if (scaleY === void 0) { scaleY = 1; }
            this.x = x;
            this.y = y;
            this.skewX = skewX;
            this.skewY = skewY;
            this.scaleX = scaleX;
            this.scaleY = scaleY;
        }
        var d = __define,c=Transform,p=c.prototype;
        /**
         * @private
         */
        Transform.normalizeRadian = function (value) {
            value = (value + Math.PI) % (Math.PI * 2);
            value += value > 0 ? -Math.PI : Math.PI;
            return value;
        };
        /**
         * @private
         */
        p.toString = function () {
            return "[object dragonBones.Transform] x:" + this.x + " y:" + this.y + " skewX:" + this.skewX * 180 / Math.PI + " skewY:" + this.skewY * 180 / Math.PI + " scaleX:" + this.scaleX + " scaleY:" + this.scaleY;
        };
        /**
         * @private
         */
        p.copyFrom = function (value) {
            var self = this;
            self.x = value.x;
            self.y = value.y;
            self.skewX = value.skewX;
            self.skewY = value.skewY;
            self.scaleX = value.scaleX;
            self.scaleY = value.scaleY;
            return this;
        };
        /**
         * @private
         */
        p.clone = function () {
            var value = new Transform();
            value.copyFrom(this);
            return value;
        };
        /**
         * @private
         */
        p.identity = function () {
            var self = this;
            self.x = self.y = self.skewX = self.skewY = 0;
            self.scaleX = self.scaleY = 1;
            return this;
        };
        /**
         * @private
         */
        p.add = function (value) {
            var self = this;
            self.x += value.x;
            self.y += value.y;
            self.skewX += value.skewX;
            self.skewY += value.skewY;
            self.scaleX *= value.scaleX;
            self.scaleY *= value.scaleY;
            return this;
        };
        /**
         * @private
         */
        p.minus = function (value) {
            var self = this;
            self.x -= value.x;
            self.y -= value.y;
            self.skewX = Transform.normalizeRadian(self.skewX - value.skewX);
            self.skewY = Transform.normalizeRadian(self.skewY - value.skewY);
            self.scaleX /= value.scaleX;
            self.scaleY /= value.scaleY;
            return this;
        };
        /**
         * @private
         */
        p.fromMatrix = function (matrix) {
            var self = this;
            var PI_Q = Math.PI * 0.25;
            var backupScaleX = self.scaleX, backupScaleY = self.scaleY;
            self.x = matrix.tx;
            self.y = matrix.ty;
            self.skewX = Math.atan(-matrix.c / matrix.d);
            self.skewY = Math.atan(matrix.b / matrix.a);
            if (self.skewX != self.skewX)
                self.skewX = 0;
            if (self.skewY != self.skewY)
                self.skewY = 0;
            self.scaleY = (self.skewX > -PI_Q && self.skewX < PI_Q) ? matrix.d / Math.cos(self.skewX) : -matrix.c / Math.sin(self.skewX);
            self.scaleX = (self.skewY > -PI_Q && self.skewY < PI_Q) ? matrix.a / Math.cos(self.skewY) : matrix.b / Math.sin(self.skewY);
            if (backupScaleX >= 0 && self.scaleX < 0) {
                self.scaleX = -self.scaleX;
                self.skewY = self.skewY - Math.PI;
            }
            if (backupScaleY >= 0 && self.scaleY < 0) {
                self.scaleY = -self.scaleY;
                self.skewX = self.skewX - Math.PI;
            }
            return this;
        };
        /**
         * @language zh_CN
         * 转换为矩阵。
         * @param 矩阵。
         * @version DragonBones 3.0
         */
        p.toMatrix = function (matrix) {
            var self = this;
            matrix.a = self.scaleX * Math.cos(self.skewY);
            matrix.b = self.scaleX * Math.sin(self.skewY);
            matrix.c = -self.scaleY * Math.sin(self.skewX);
            matrix.d = self.scaleY * Math.cos(self.skewX);
            matrix.tx = self.x;
            matrix.ty = self.y;
        };
        d(p, "rotation"
            /**
             * @language zh_CN
             * 旋转。 (以弧度为单位)
             * @version DragonBones 3.0
             */
            ,function () {
                return this.skewY;
            }
            ,function (value) {
                var dValue = value - this.skewY;
                this.skewX += dValue;
                this.skewY += dValue;
            }
        );
        return Transform;
    }());
    dragonBones.Transform = Transform;
    egret.registerClass(Transform,'dragonBones.Transform');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var TimelineData = (function (_super) {
        __extends(TimelineData, _super);
        function TimelineData() {
            _super.call(this);
            /**
             * @private
             */
            this.frames = [];
        }
        var d = __define,c=TimelineData,p=c.prototype;
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.scale = 1;
            self.offset = 0;
            if (self.frames.length) {
                var prevFrame = null;
                for (var i = 0, l = self.frames.length; i < l; ++i) {
                    var frame = self.frames[i];
                    if (prevFrame && frame != prevFrame) {
                        prevFrame.returnToPool();
                    }
                    prevFrame = frame;
                }
                self.frames.length = 0;
            }
        };
        return TimelineData;
    }(dragonBones.BaseObject));
    dragonBones.TimelineData = TimelineData;
    egret.registerClass(TimelineData,'dragonBones.TimelineData');
    /**
     * @private
     */
    var BoneTimelineData = (function (_super) {
        __extends(BoneTimelineData, _super);
        function BoneTimelineData() {
            _super.call(this);
            this.bone = null;
            this.originTransform = new dragonBones.Transform();
            this.cachedFrames = [];
        }
        var d = __define,c=BoneTimelineData,p=c.prototype;
        BoneTimelineData.cacheFrame = function (cacheFrames, cacheFrameIndex, globalTransformMatrix) {
            var cacheMatrix = cacheFrames[cacheFrameIndex] = new dragonBones.Matrix();
            cacheMatrix.copyFrom(globalTransformMatrix);
            return cacheMatrix;
        };
        BoneTimelineData.toString = function () {
            return "[Class dragonBones.BoneTimelineData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.bone = null;
            self.originTransform.identity();
            if (self.cachedFrames.length) {
                self.cachedFrames.length = 0;
            }
        };
        p.cacheFrames = function (cacheFrameCount) {
            this.cachedFrames.length = 0;
            this.cachedFrames.length = cacheFrameCount;
        };
        return BoneTimelineData;
    }(TimelineData));
    dragonBones.BoneTimelineData = BoneTimelineData;
    egret.registerClass(BoneTimelineData,'dragonBones.BoneTimelineData');
    /**
     * @private
     */
    var SlotTimelineData = (function (_super) {
        __extends(SlotTimelineData, _super);
        function SlotTimelineData() {
            _super.call(this);
            this.slot = null;
            this.cachedFrames = [];
        }
        var d = __define,c=SlotTimelineData,p=c.prototype;
        SlotTimelineData.cacheFrame = function (cacheFrames, cacheFrameIndex, globalTransformMatrix) {
            var cacheMatrix = cacheFrames[cacheFrameIndex] = new dragonBones.Matrix();
            cacheMatrix.copyFrom(globalTransformMatrix);
            return cacheMatrix;
        };
        SlotTimelineData.toString = function () {
            return "[Class dragonBones.SlotTimelineData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.slot = null;
            if (self.cachedFrames.length) {
                self.cachedFrames.length = 0;
            }
        };
        p.cacheFrames = function (cacheFrameCount) {
            this.cachedFrames.length = 0;
            this.cachedFrames.length = cacheFrameCount;
        };
        return SlotTimelineData;
    }(TimelineData));
    dragonBones.SlotTimelineData = SlotTimelineData;
    egret.registerClass(SlotTimelineData,'dragonBones.SlotTimelineData');
    /**
     * @private
     */
    var FFDTimelineData = (function (_super) {
        __extends(FFDTimelineData, _super);
        function FFDTimelineData() {
            _super.call(this);
            this.displayIndex = 0;
            this.skin = null;
            this.slot = null;
        }
        var d = __define,c=FFDTimelineData,p=c.prototype;
        FFDTimelineData.toString = function () {
            return "[Class dragonBones.FFDTimelineData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.displayIndex = 0;
            self.skin = null;
            self.slot = null;
        };
        return FFDTimelineData;
    }(TimelineData));
    dragonBones.FFDTimelineData = FFDTimelineData;
    egret.registerClass(FFDTimelineData,'dragonBones.FFDTimelineData');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 动画数据。
     * @version DragonBones 3.0
     */
    var AnimationData = (function (_super) {
        __extends(AnimationData, _super);
        /**
         * @private
         */
        function AnimationData() {
            _super.call(this);
            /**
             * @private
             */
            this.boneTimelines = {};
            /**
             * @private
             */
            this.slotTimelines = {};
            /**
             * @private
             */
            this.ffdTimelines = {}; // skin slot displayIndex
            /**
             * @private
             */
            this.cachedFrames = [];
        }
        var d = __define,c=AnimationData,p=c.prototype;
        /**
         * @private
         */
        AnimationData.toString = function () {
            return "[Class dragonBones.AnimationData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.hasAsynchronyTimeline = false;
            self.cacheTimeToFrameScale = 0;
            self.position = 0;
            self.duration = 0;
            self.playTimes = 0;
            self.fadeInTime = 0;
            self.name = null;
            self.animation = null;
            for (var i in self.boneTimelines) {
                self.boneTimelines[i].returnToPool();
                delete self.boneTimelines[i];
            }
            for (var i in self.slotTimelines) {
                self.slotTimelines[i].returnToPool();
                delete self.slotTimelines[i];
            }
            for (var i in self.ffdTimelines) {
                for (var j in self.ffdTimelines[i]) {
                    for (var k in self.ffdTimelines[i][j]) {
                        self.ffdTimelines[i][j][k].returnToPool();
                    }
                }
                delete self.ffdTimelines[i];
            }
            if (self.cachedFrames.length) {
                self.cachedFrames.length = 0;
            }
        };
        /**
         * @private
         */
        p.cacheFrames = function (value) {
            var self = this;
            if (self.animation) {
                return;
            }
            var cacheFrameCount = Math.max(Math.floor(self.frameCount * self.scale * value), 1);
            self.cacheTimeToFrameScale = cacheFrameCount / (self.duration + 0.000001); //
            self.cachedFrames.length = 0;
            self.cachedFrames.length = cacheFrameCount;
            for (var i in self.boneTimelines) {
                self.boneTimelines[i].cacheFrames(cacheFrameCount);
            }
            for (var i in self.slotTimelines) {
                self.slotTimelines[i].cacheFrames(cacheFrameCount);
            }
        };
        /**
         * @private
         */
        p.addBoneTimeline = function (value) {
            if (value && value.bone && !this.boneTimelines[value.bone.name]) {
                this.boneTimelines[value.bone.name] = value;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        p.addSlotTimeline = function (value) {
            if (value && value.slot && !this.slotTimelines[value.slot.name]) {
                this.slotTimelines[value.slot.name] = value;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        p.addFFDTimeline = function (value) {
            if (value && value.skin && value.slot) {
                var skin = this.ffdTimelines[value.skin.name] = this.ffdTimelines[value.skin.name] || {};
                var slot = skin[value.slot.slot.name] = skin[value.slot.slot.name] || {};
                if (!slot[value.displayIndex]) {
                    slot[value.displayIndex] = value;
                }
                else {
                    throw new Error();
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        p.getBoneTimeline = function (name) {
            return this.boneTimelines[name];
        };
        /**
         * @private
         */
        p.getSlotTimeline = function (name) {
            return this.slotTimelines[name];
        };
        /**
         * @private
         */
        p.getFFDTimeline = function (skinName, slotName, displayIndex) {
            var skin = this.ffdTimelines[skinName];
            if (skin) {
                var slot = skin[slotName];
                if (slot) {
                    return slot[displayIndex];
                }
            }
            return null;
        };
        return AnimationData;
    }(dragonBones.TimelineData));
    dragonBones.AnimationData = AnimationData;
    egret.registerClass(AnimationData,'dragonBones.AnimationData');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 骨架数据。
     * @see dragonBones.Armature
     * @version DragonBones 3.0
     */
    var ArmatureData = (function (_super) {
        __extends(ArmatureData, _super);
        /**
         * @private
         */
        function ArmatureData() {
            _super.call(this);
            /**
             * @private
             */
            this.parent = null;
            /**
             * @language zh_CN
             * 所有的骨骼数据。
             * @see dragonBones.BoneData
             * @version DragonBones 3.0
             */
            this.bones = {};
            /**
             * @language zh_CN
             * 所有的插槽数据。
             * @see dragonBones.SlotData
             * @version DragonBones 3.0
             */
            this.slots = {};
            /**
             * @language zh_CN
             * 所有的皮肤数据。
             * @see dragonBones.SkinData
             * @version DragonBones 3.0
             */
            this.skins = {};
            /**
             * @language zh_CN
             * 所有的动画数据。
             * @see dragonBones.AnimationData
             * @version DragonBones 3.0
             */
            this.animations = {};
            /**
             * @private
             */
            this.actions = [];
            this._sortedBones = [];
            this._sortedSlots = [];
            this._bonesChildren = {};
        }
        var d = __define,c=ArmatureData,p=c.prototype;
        ArmatureData._onSortSlots = function (a, b) {
            return a.zOrder > b.zOrder ? 1 : -1;
        };
        /**
         * @private
         */
        ArmatureData.toString = function () {
            return "[Class dragonBones.ArmatureData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.frameRate = 0;
            self.cacheFrameRate = 0;
            self.type = 0 /* Armature */;
            self.name = null;
            self.parent = null;
            for (var i in self.bones) {
                self.bones[i].returnToPool();
                delete self.bones[i];
            }
            for (var i in self.slots) {
                self.slots[i].returnToPool();
                delete self.slots[i];
            }
            for (var i in self.skins) {
                self.skins[i].returnToPool();
                delete self.skins[i];
            }
            for (var i in self.animations) {
                self.animations[i].returnToPool();
                delete self.animations[i];
            }
            if (self.actions.length) {
                for (var i = 0, l = self.actions.length; i < l; ++i) {
                    self.actions[i].returnToPool();
                }
                self.actions.length = 0;
            }
            self._boneDirty = false;
            self._slotDirty = false;
            self._defaultSkin = null;
            self._defaultAnimation = null;
            if (self._sortedBones.length) {
                self._sortedBones.length = 0;
            }
            if (self._sortedSlots.length) {
                self._sortedSlots.length = 0;
            }
            for (var i in self._bonesChildren) {
                delete self._bonesChildren[i];
            }
        };
        p._sortBones = function () {
            var self = this;
            var total = self._sortedBones.length;
            if (!total) {
                return;
            }
            var sortHelper = self._sortedBones.concat();
            var index = 0;
            var count = 0;
            self._sortedBones.length = 0;
            while (count < total) {
                var bone = sortHelper[index++];
                if (index >= total) {
                    index = 0;
                }
                if (self._sortedBones.indexOf(bone) >= 0) {
                    continue;
                }
                if (bone.parent && self._sortedBones.indexOf(bone.parent) < 0) {
                    continue;
                }
                if (bone.ik && self._sortedBones.indexOf(bone.ik) < 0) {
                    continue;
                }
                if (bone.ik && bone.chain > 0 && bone.chainIndex == bone.chain) {
                    self._sortedBones.splice(self._sortedBones.indexOf(bone.parent) + 1, 0, bone);
                }
                else {
                    self._sortedBones.push(bone);
                }
                count++;
            }
        };
        p._sortSlots = function () {
            this._sortedSlots.sort(ArmatureData._onSortSlots);
        };
        /**
         * @private
         */
        p.cacheFrames = function (value) {
            var self = this;
            if (self.cacheFrameRate == value) {
                return;
            }
            self.cacheFrameRate = value;
            var frameScale = self.cacheFrameRate / self.frameRate;
            for (var i in self.animations) {
                self.animations[i].cacheFrames(frameScale);
            }
        };
        /**
         * @private
         */
        p.addBone = function (value, parentName) {
            var self = this;
            if (value && value.name && !self.bones[value.name]) {
                if (parentName) {
                    var parent_1 = self.getBone(parentName);
                    if (parent_1) {
                        value.parent = parent_1;
                    }
                    else {
                        (self._bonesChildren[parentName] = self._bonesChildren[parentName] || []).push(value);
                    }
                }
                var children = self._bonesChildren[value.name];
                if (children) {
                    for (var i = 0, l = children.length; i < l; ++i) {
                        children[i].parent = value;
                    }
                    delete self._bonesChildren[value.name];
                }
                self.bones[value.name] = value;
                self._sortedBones.push(value);
                self._boneDirty = true;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        p.addSlot = function (value) {
            if (value && value.name && !this.slots[value.name]) {
                this.slots[value.name] = value;
                this._sortedSlots.push(value);
                this._slotDirty = true;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        p.addSkin = function (value) {
            if (value && value.name && !this.skins[value.name]) {
                this.skins[value.name] = value;
                if (!this._defaultSkin) {
                    this._defaultSkin = value;
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        p.addAnimation = function (value) {
            if (value && value.name && !this.animations[value.name]) {
                this.animations[value.name] = value;
                if (!this._defaultAnimation) {
                    this._defaultAnimation = value;
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * @language zh_CN
         * 获取指定名称的骨骼数据。
         * @param name 骨骼数据名称。
         * @see dragonBones.BoneData
         * @version DragonBones 3.0
         */
        p.getBone = function (name) {
            return this.bones[name];
        };
        /**
         * @language zh_CN
         * 获取指定名称的插槽数据。
         * @param name 插槽数据名称。
         * @see dragonBones.SlotData
         * @version DragonBones 3.0
         */
        p.getSlot = function (name) {
            return this.slots[name];
        };
        /**
         * @language zh_CN
         * 获取指定名称的皮肤数据。
         * @param name 皮肤数据名称。
         * @see dragonBones.SkinData
         * @version DragonBones 3.0
         */
        p.getSkin = function (name) {
            return name ? this.skins[name] : this._defaultSkin;
        };
        /**
         * @language zh_CN
         * 获取指定名称的动画数据。
         * @param name 动画数据名称。
         * @see dragonBones.AnimationData
         * @version DragonBones 3.0
         */
        p.getAnimation = function (name) {
            return name ? this.animations[name] : this._defaultAnimation;
        };
        d(p, "sortedBones"
            /**
             * @private
             */
            ,function () {
                if (this._boneDirty) {
                    this._boneDirty = false;
                    this._sortBones();
                }
                return this._sortedBones;
            }
        );
        d(p, "sortedSlots"
            /**
             * @private
             */
            ,function () {
                if (this._slotDirty) {
                    this._slotDirty = false;
                    this._sortSlots();
                }
                return this._sortedSlots;
            }
        );
        d(p, "defaultSkin"
            /**
             * @language zh_CN
             * 获取默认的皮肤数据。
             * @see dragonBones.SkinData
             * @version DragonBones 4.5
             */
            ,function () {
                return this._defaultSkin;
            }
        );
        d(p, "defaultAnimation"
            /**
             * @language zh_CN
             * 获取默认的动画数据。
             * @see dragonBones.AnimationData
             * @version DragonBones 4.5
             */
            ,function () {
                return this._defaultAnimation;
            }
        );
        return ArmatureData;
    }(dragonBones.BaseObject));
    dragonBones.ArmatureData = ArmatureData;
    egret.registerClass(ArmatureData,'dragonBones.ArmatureData');
    /**
     * @language zh_CN
     * 骨骼数据。
     * @see dragonBones.Bone
     * @version DragonBones 3.0
     */
    var BoneData = (function (_super) {
        __extends(BoneData, _super);
        /**
         * @private
         */
        function BoneData() {
            _super.call(this);
            /**
             * @private
             */
            this.transform = new dragonBones.Transform();
        }
        var d = __define,c=BoneData,p=c.prototype;
        /**
         * @private
         */
        BoneData.toString = function () {
            return "[Class dragonBones.BoneData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.inheritTranslation = false;
            self.inheritRotation = false;
            self.inheritScale = false;
            self.bendPositive = false;
            self.chain = 0;
            self.chainIndex = 0;
            self.weight = 0;
            self.length = 0;
            self.name = null;
            self.parent = null;
            self.ik = null;
            self.transform.identity();
        };
        return BoneData;
    }(dragonBones.BaseObject));
    dragonBones.BoneData = BoneData;
    egret.registerClass(BoneData,'dragonBones.BoneData');
    /**
     * @language zh_CN
     * 插槽数据。
     * @see dragonBones.Slot
     * @version DragonBones 3.0
     */
    var SlotData = (function (_super) {
        __extends(SlotData, _super);
        /**
         * @private
         */
        function SlotData() {
            _super.call(this);
            /**
             * @private
             */
            this.actions = [];
        }
        var d = __define,c=SlotData,p=c.prototype;
        /**
         * @private
         */
        SlotData.generateColor = function () {
            return new dragonBones.ColorTransform();
        };
        /**
         * @private
         */
        SlotData.toString = function () {
            return "[Class dragonBones.SlotData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.displayIndex = 0;
            self.zOrder = 0;
            self.blendMode = 0 /* Normal */;
            self.name = null;
            self.parent = null;
            self.color = null;
            if (self.actions.length) {
                for (var i = 0, l = self.actions.length; i < l; ++i) {
                    self.actions[i].returnToPool();
                }
                self.actions.length = 0;
            }
        };
        /**
         * @private
         */
        SlotData.DEFAULT_COLOR = new dragonBones.ColorTransform();
        return SlotData;
    }(dragonBones.BaseObject));
    dragonBones.SlotData = SlotData;
    egret.registerClass(SlotData,'dragonBones.SlotData');
    /**
     * @language zh_CN
     * 皮肤数据。
     * @version DragonBones 3.0
     */
    var SkinData = (function (_super) {
        __extends(SkinData, _super);
        /**
         * @private
         */
        function SkinData() {
            _super.call(this);
            /**
             * @language zh_CN
             * 数据名称。
             * @version DragonBones 3.0
             */
            this.name = null;
            /**
             * @private
             */
            this.slots = {};
        }
        var d = __define,c=SkinData,p=c.prototype;
        /**
         * @private
         */
        SkinData.toString = function () {
            return "[Class dragonBones.SkinData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.name = null;
            for (var i in self.slots) {
                self.slots[i].returnToPool();
                delete self.slots[i];
            }
        };
        /**
         * @private
         */
        p.addSlot = function (value) {
            if (value && value.slot && !this.slots[value.slot.name]) {
                this.slots[value.slot.name] = value;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        p.getSlot = function (name) {
            return this.slots[name];
        };
        return SkinData;
    }(dragonBones.BaseObject));
    dragonBones.SkinData = SkinData;
    egret.registerClass(SkinData,'dragonBones.SkinData');
    /**
     * @private
     */
    var SlotDisplayDataSet = (function (_super) {
        __extends(SlotDisplayDataSet, _super);
        function SlotDisplayDataSet() {
            _super.call(this);
            this.displays = [];
        }
        var d = __define,c=SlotDisplayDataSet,p=c.prototype;
        SlotDisplayDataSet.toString = function () {
            return "[Class dragonBones.SlotDisplayDataSet]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            this.slot = null;
            if (this.displays.length) {
                for (var i = 0, l = this.displays.length; i < l; ++i) {
                    this.displays[i].returnToPool();
                }
                this.displays.length = 0;
            }
        };
        return SlotDisplayDataSet;
    }(dragonBones.BaseObject));
    dragonBones.SlotDisplayDataSet = SlotDisplayDataSet;
    egret.registerClass(SlotDisplayDataSet,'dragonBones.SlotDisplayDataSet');
    /**
     * @private
     */
    var DisplayData = (function (_super) {
        __extends(DisplayData, _super);
        function DisplayData() {
            _super.call(this);
            this.pivot = new dragonBones.Point();
            this.transform = new dragonBones.Transform();
        }
        var d = __define,c=DisplayData,p=c.prototype;
        DisplayData.toString = function () {
            return "[Class dragonBones.DisplayData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.isRelativePivot = false;
            self.type = 0 /* Image */;
            self.name = null;
            self.textureData = null;
            self.armatureData = null;
            if (self.meshData) {
                self.meshData.returnToPool();
                self.meshData = null;
            }
            self.pivot.clear();
            self.transform.identity();
        };
        return DisplayData;
    }(dragonBones.BaseObject));
    dragonBones.DisplayData = DisplayData;
    egret.registerClass(DisplayData,'dragonBones.DisplayData');
    /**
     * @private
     */
    var MeshData = (function (_super) {
        __extends(MeshData, _super);
        function MeshData() {
            _super.call(this);
            this.slotPose = new dragonBones.Matrix();
            this.uvs = []; // vertices * 2
            this.vertices = []; // vertices * 2
            this.vertexIndices = []; // triangles * 3
            this.boneIndices = []; // vertices bones
            this.weights = []; // vertices bones
            this.boneVertices = []; // vertices bones * 2
            this.bones = []; // bones
            this.inverseBindPose = []; // bones
        }
        var d = __define,c=MeshData,p=c.prototype;
        MeshData.toString = function () {
            return "[Class dragonBones.MeshData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.skinned = false;
            self.slotPose.identity();
            if (self.uvs.length) {
                self.uvs.length = 0;
            }
            if (self.vertices.length) {
                self.vertices.length = 0;
            }
            if (self.vertexIndices.length) {
                self.vertexIndices.length = 0;
            }
            if (self.boneIndices.length) {
                self.boneIndices.length = 0;
            }
            if (self.weights.length) {
                self.weights.length = 0;
            }
            if (self.boneVertices.length) {
                self.boneVertices.length = 0;
            }
            if (self.bones.length) {
                self.bones.length = 0;
            }
            if (self.inverseBindPose.length) {
                self.inverseBindPose.length = 0;
            }
        };
        return MeshData;
    }(dragonBones.BaseObject));
    dragonBones.MeshData = MeshData;
    egret.registerClass(MeshData,'dragonBones.MeshData');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 龙骨数据，包含多个骨架数据。
     * @see dragonBones.ArmatureData
     * @version DragonBones 3.0
     */
    var DragonBonesData = (function (_super) {
        __extends(DragonBonesData, _super);
        /**
         * @private
         */
        function DragonBonesData() {
            _super.call(this);
            /**
             * @language zh_CN
             * 所有的骨架数据。
             * @see dragonBones.ArmatureData
             * @version DragonBones 3.0
             */
            this.armatures = {};
            this._armatureNames = [];
        }
        var d = __define,c=DragonBonesData,p=c.prototype;
        /**
         * @private
         */
        DragonBonesData.toString = function () {
            return "[Class dragonBones.DragonBonesData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.autoSearch = false;
            self.frameRate = 0;
            self.name = null;
            for (var i in self.armatures) {
                self.armatures[i].returnToPool();
                delete self.armatures[i];
            }
            if (self._armatureNames.length) {
                self._armatureNames.length = 0;
            }
        };
        /**
         * @language zh_CN
         * 获取指定名称的骨架。
         * @param name 骨架数据骨架名称。
         * @see dragonBones.ArmatureData
         * @version DragonBones 3.0
         */
        p.getArmature = function (name) {
            return this.armatures[name];
        };
        /**
         * @private
         */
        p.addArmature = function (value) {
            if (value && value.name && !this.armatures[value.name]) {
                this.armatures[value.name] = value;
                this._armatureNames.push(value.name);
                value.parent = this;
            }
            else {
                throw new Error();
            }
        };
        d(p, "armatureNames"
            /**
             * @language zh_CN
             * 所有的骨架数据名称。
             * @see #armatures
             * @version DragonBones 3.0
             */
            ,function () {
                return this._armatureNames;
            }
        );
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#removeDragonBonesData()
         */
        p.dispose = function () {
            this.returnToPool();
        };
        return DragonBonesData;
    }(dragonBones.BaseObject));
    dragonBones.DragonBonesData = DragonBonesData;
    egret.registerClass(DragonBonesData,'dragonBones.DragonBonesData');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var ActionData = (function (_super) {
        __extends(ActionData, _super);
        function ActionData() {
            _super.call(this);
        }
        var d = __define,c=ActionData,p=c.prototype;
        ActionData.toString = function () {
            return "[Class dragonBones.ActionData]";
        };
        p._onClear = function () {
            var self = this;
            self.type = 0 /* Play */;
            self.data = null;
            self.bone = null;
            self.slot = null;
        };
        return ActionData;
    }(dragonBones.BaseObject));
    dragonBones.ActionData = ActionData;
    egret.registerClass(ActionData,'dragonBones.ActionData');
    /**
     * @private
     */
    var EventData = (function (_super) {
        __extends(EventData, _super);
        function EventData() {
            _super.call(this);
        }
        var d = __define,c=EventData,p=c.prototype;
        EventData.toString = function () {
            return "[Class dragonBones.EventData]";
        };
        p._onClear = function () {
            var self = this;
            self.type = 0 /* Frame */;
            self.name = null;
            self.data = null;
            self.bone = null;
            self.slot = null;
        };
        return EventData;
    }(dragonBones.BaseObject));
    dragonBones.EventData = EventData;
    egret.registerClass(EventData,'dragonBones.EventData');
    /**
     * @private
     */
    var FrameData = (function (_super) {
        __extends(FrameData, _super);
        function FrameData() {
            _super.call(this);
        }
        var d = __define,c=FrameData,p=c.prototype;
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            self.position = 0;
            self.duration = 0;
            self.prev = null;
            self.next = null;
        };
        return FrameData;
    }(dragonBones.BaseObject));
    dragonBones.FrameData = FrameData;
    egret.registerClass(FrameData,'dragonBones.FrameData');
    /**
     * @private
     */
    var TweenFrameData = (function (_super) {
        __extends(TweenFrameData, _super);
        function TweenFrameData() {
            _super.call(this);
        }
        var d = __define,c=TweenFrameData,p=c.prototype;
        TweenFrameData.samplingCurve = function (curve, frameCount) {
            if (curve.length == 0 || frameCount == 0) {
                return null;
            }
            var samplingTimes = frameCount + 2;
            var samplingStep = 1 / samplingTimes;
            var sampling = new Array((samplingTimes - 1) * 2);
            //
            curve.unshift(0, 0);
            curve.push(1, 1);
            var stepIndex = 0;
            for (var i = 0; i < samplingTimes - 1; ++i) {
                var step = samplingStep * (i + 1);
                while (curve[stepIndex + 6] < step) {
                    stepIndex += 6; // stepIndex += 3 * 2
                }
                var x1 = curve[stepIndex];
                var x4 = curve[stepIndex + 6];
                var t = (step - x1) / (x4 - x1);
                var l_t = 1 - t;
                var powA = l_t * l_t;
                var powB = t * t;
                var kA = l_t * powA;
                var kB = 3 * t * powA;
                var kC = 3 * l_t * powB;
                var kD = t * powB;
                sampling[i * 2] = kA * x1 + kB * curve[stepIndex + 2] + kC * curve[stepIndex + 4] + kD * x4;
                sampling[i * 2 + 1] = kA * curve[stepIndex + 1] + kB * curve[stepIndex + 3] + kC * curve[stepIndex + 5] + kD * curve[stepIndex + 7];
            }
            return sampling;
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            _super.prototype._onClear.call(this);
            this.tweenEasing = 0;
            this.curve = null;
        };
        return TweenFrameData;
    }(FrameData));
    dragonBones.TweenFrameData = TweenFrameData;
    egret.registerClass(TweenFrameData,'dragonBones.TweenFrameData');
    /**
     * @private
     */
    var AnimationFrameData = (function (_super) {
        __extends(AnimationFrameData, _super);
        function AnimationFrameData() {
            _super.call(this);
            this.actions = [];
            this.events = [];
        }
        var d = __define,c=AnimationFrameData,p=c.prototype;
        AnimationFrameData.toString = function () {
            return "[Class dragonBones.AnimationFrameData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            if (self.actions.length) {
                for (var i = 0, l = self.actions.length; i < l; ++i) {
                    self.actions[i].returnToPool();
                }
                self.actions.length = 0;
            }
            if (self.events.length) {
                for (var i = 0, l = self.events.length; i < l; ++i) {
                    self.events[i].returnToPool();
                }
                self.events.length = 0;
            }
        };
        return AnimationFrameData;
    }(FrameData));
    dragonBones.AnimationFrameData = AnimationFrameData;
    egret.registerClass(AnimationFrameData,'dragonBones.AnimationFrameData');
    /**
     * @private
     */
    var BoneFrameData = (function (_super) {
        __extends(BoneFrameData, _super);
        function BoneFrameData() {
            _super.call(this);
            this.transform = new dragonBones.Transform();
        }
        var d = __define,c=BoneFrameData,p=c.prototype;
        BoneFrameData.toString = function () {
            return "[Class dragonBones.BoneFrameData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.tweenScale = false;
            self.tweenRotate = 0;
            self.transform.identity();
        };
        return BoneFrameData;
    }(TweenFrameData));
    dragonBones.BoneFrameData = BoneFrameData;
    egret.registerClass(BoneFrameData,'dragonBones.BoneFrameData');
    /**
     * @private
     */
    var SlotFrameData = (function (_super) {
        __extends(SlotFrameData, _super);
        function SlotFrameData() {
            _super.call(this);
        }
        var d = __define,c=SlotFrameData,p=c.prototype;
        SlotFrameData.generateColor = function () {
            return new dragonBones.ColorTransform();
        };
        SlotFrameData.toString = function () {
            return "[Class dragonBones.SlotFrameData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.displayIndex = 0;
            self.zOrder = 0;
            self.color = null;
        };
        SlotFrameData.DEFAULT_COLOR = new dragonBones.ColorTransform();
        return SlotFrameData;
    }(TweenFrameData));
    dragonBones.SlotFrameData = SlotFrameData;
    egret.registerClass(SlotFrameData,'dragonBones.SlotFrameData');
    /**
     * @private
     */
    var ExtensionFrameData = (function (_super) {
        __extends(ExtensionFrameData, _super);
        function ExtensionFrameData() {
            _super.call(this);
            this.tweens = [];
            this.keys = [];
        }
        var d = __define,c=ExtensionFrameData,p=c.prototype;
        ExtensionFrameData.toString = function () {
            return "[Class dragonBones.ExtensionFrameData]";
        };
        /**
         * @inheritDoc
         */
        p._onClear = function () {
            var self = this;
            _super.prototype._onClear.call(this);
            self.type = 0 /* FFD */;
            if (self.tweens.length) {
                self.tweens.length = 0;
            }
            if (self.keys.length) {
                self.keys.length = 0;
            }
        };
        return ExtensionFrameData;
    }(TweenFrameData));
    dragonBones.ExtensionFrameData = ExtensionFrameData;
    egret.registerClass(ExtensionFrameData,'dragonBones.ExtensionFrameData');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var DataParser = (function () {
        function DataParser() {
            this._data = null;
            this._armature = null;
            this._skin = null;
            this._slotDisplayDataSet = null;
            this._mesh = null;
            this._animation = null;
            this._timeline = null;
            this._isParentCooriinate = false;
            this._isAutoTween = false;
            this._animationTweenEasing = 0;
            this._armatureScale = 1;
            this._helpPoint = new dragonBones.Point();
            this._helpTransform = new dragonBones.Transform();
            this._helpMatrix = new dragonBones.Matrix();
            this._rawBones = [];
        }
        var d = __define,c=DataParser,p=c.prototype;
        DataParser._getArmatureType = function (value) {
            switch (value.toLowerCase()) {
                case "stage":
                    return 0 /* Armature */;
                case "armature":
                    return 0 /* Armature */;
                case "movieClip":
                    return 1 /* MovieClip */;
                default:
                    return 0 /* Armature */;
            }
        };
        DataParser._getDisplayType = function (value) {
            switch (value.toLowerCase()) {
                case "image":
                    return 0 /* Image */;
                case "armature":
                    return 1 /* Armature */;
                case "mesh":
                    return 2 /* Mesh */;
                default:
                    return 0 /* Image */;
            }
        };
        DataParser._getBlendMode = function (value) {
            switch (value.toLowerCase()) {
                case "normal":
                    return 0 /* Normal */;
                case "add":
                    return 1 /* Add */;
                case "alpha":
                    return 2 /* Alpha */;
                case "darken":
                    return 3 /* Darken */;
                case "difference":
                    return 4 /* Difference */;
                case "erase":
                    return 5 /* Erase */;
                case "hardlight":
                    return 6 /* HardLight */;
                case "invert":
                    return 7 /* Invert */;
                case "layer":
                    return 8 /* Layer */;
                case "lighten":
                    return 9 /* Lighten */;
                case "multiply":
                    return 10 /* Multiply */;
                case "overlay":
                    return 11 /* Overlay */;
                case "screen":
                    return 12 /* Screen */;
                case "subtract":
                    return 13 /* Subtract */;
                default:
                    return 0 /* Normal */;
            }
        };
        DataParser._getActionType = function (value) {
            switch (value.toLowerCase()) {
                case "play":
                    return 0 /* Play */;
                case "stop":
                    return 1 /* Stop */;
                case "gotoandplay":
                    return 2 /* GotoAndPlay */;
                case "gotoandstop":
                    return 3 /* GotoAndStop */;
                case "fadein":
                    return 4 /* FadeIn */;
                case "fadeout":
                    return 5 /* FadeOut */;
                default:
                    return 4 /* FadeIn */;
            }
        };
        p._getTimelineFrameMatrix = function (animation, timeline, position, transform) {
            var frameIndex = Math.floor(position * animation.frameCount / animation.duration); // uint()
            if (timeline.frames.length == 1 || frameIndex >= timeline.frames.length) {
                transform.copyFrom(timeline.frames[0].transform);
            }
            else {
                var frame = timeline.frames[frameIndex];
                var tweenProgress = 0;
                if (frame.duration > 0 && frame.tweenEasing != dragonBones.DragonBones.NO_TWEEN) {
                    tweenProgress = (position - frame.position) / frame.duration;
                    if (frame.tweenEasing != 0) {
                        tweenProgress = dragonBones.TweenTimelineState._getEasingValue(tweenProgress, frame.tweenEasing);
                    }
                }
                else if (frame.curve) {
                    tweenProgress = (position - frame.position) / frame.duration;
                    tweenProgress = dragonBones.TweenTimelineState._getCurveEasingValue(tweenProgress, frame.curve);
                }
                transform.x = frame.next.transform.x - frame.transform.x;
                transform.y = frame.next.transform.y - frame.transform.y;
                transform.skewX = dragonBones.Transform.normalizeRadian(frame.next.transform.skewX - frame.transform.skewX);
                transform.skewY = dragonBones.Transform.normalizeRadian(frame.next.transform.skewY - frame.transform.skewY);
                transform.scaleX = frame.next.transform.scaleX - frame.transform.scaleX;
                transform.scaleY = frame.next.transform.scaleY - frame.transform.scaleY;
                transform.x = frame.transform.x + transform.x * tweenProgress;
                transform.y = frame.transform.y + transform.y * tweenProgress;
                transform.skewX = frame.transform.skewX + transform.skewX * tweenProgress;
                transform.skewY = frame.transform.skewY + transform.skewY * tweenProgress;
                transform.scaleX = frame.transform.scaleX + transform.scaleX * tweenProgress;
                transform.scaleY = frame.transform.scaleY + transform.scaleY * tweenProgress;
            }
            transform.add(timeline.originTransform);
        };
        p._mergeFrameToAnimationTimeline = function (frame, actions, events) {
            var frameStart = Math.floor(frame.position * this._armature.frameRate); // uint()
            var frames = this._animation.frames;
            if (frames.length == 0) {
                var startFrame = dragonBones.BaseObject.borrowObject(dragonBones.AnimationFrameData); // Add start frame.
                startFrame.position = 0;
                if (this._animation.frameCount > 1) {
                    frames.length = this._animation.frameCount + 1; // One more count for zero duration frame.
                    var endFrame = dragonBones.BaseObject.borrowObject(dragonBones.AnimationFrameData); // Add end frame to keep animation timeline has two different frames atleast.
                    endFrame.position = this._animation.frameCount / this._armature.frameRate;
                    frames[0] = startFrame;
                    frames[this._animation.frameCount] = endFrame;
                }
            }
            var insertedFrame = null;
            var replacedFrame = frames[frameStart];
            if (replacedFrame && (frameStart == 0 || frames[frameStart - 1] == replacedFrame.prev)) {
                insertedFrame = replacedFrame;
            }
            else {
                insertedFrame = dragonBones.BaseObject.borrowObject(dragonBones.AnimationFrameData); // Create frame.
                insertedFrame.position = frameStart / this._armature.frameRate;
                frames[frameStart] = insertedFrame;
                for (var i = frameStart + 1, l = frames.length; i < l; ++i) {
                    if (replacedFrame && frames[i] == replacedFrame) {
                        frames[i] = null;
                    }
                }
            }
            if (actions) {
                for (var i = 0, l = actions.length; i < l; ++i) {
                    insertedFrame.actions.push(actions[i]);
                }
            }
            if (events) {
                for (var i = 0, l = events.length; i < l; ++i) {
                    insertedFrame.events.push(events[i]);
                }
            }
            // Modify frame link and duration.
            var prevFrame = null;
            var nextFrame = null;
            for (var i = 0, l = frames.length; i < l; ++i) {
                var currentFrame = frames[i];
                if (currentFrame && nextFrame != currentFrame) {
                    nextFrame = currentFrame;
                    if (prevFrame) {
                        nextFrame.prev = prevFrame;
                        prevFrame.next = nextFrame;
                        prevFrame.duration = nextFrame.position - prevFrame.position;
                    }
                    prevFrame = nextFrame;
                }
                else {
                    frames[i] = prevFrame;
                }
            }
            nextFrame.duration = this._animation.duration - nextFrame.position;
            nextFrame = frames[0];
            prevFrame.next = nextFrame;
            nextFrame.prev = prevFrame;
        };
        p._globalToLocal = function (armature) {
            var keyFrames = [];
            var bones = armature.sortedBones.concat().reverse();
            for (var i = 0, l = bones.length; i < l; ++i) {
                var bone = bones[i];
                if (bone.parent) {
                    bone.parent.transform.toMatrix(this._helpMatrix);
                    this._helpMatrix.invert();
                    this._helpMatrix.transformPoint(bone.transform.x, bone.transform.y, bone.transform);
                    bone.transform.rotation -= bone.parent.transform.rotation;
                }
                for (var i_4 in armature.animations) {
                    var animation = armature.animations[i_4];
                    var timeline = animation.getBoneTimeline(bone.name);
                    if (!timeline) {
                        continue;
                    }
                    var parentTimeline = timeline.bone.parent ? animation.getBoneTimeline(timeline.bone.parent.name) : null;
                    keyFrames.length = 0;
                    for (var i_5 = 0, l_3 = timeline.frames.length; i_5 < l_3; ++i_5) {
                        var frame = timeline.frames[i_5];
                        if (keyFrames.indexOf(frame) >= 0) {
                            continue;
                        }
                        keyFrames.push(frame);
                        if (parentTimeline) {
                            this._getTimelineFrameMatrix(animation, parentTimeline, frame.position, this._helpTransform);
                            frame.transform.add(timeline.originTransform);
                            this._helpTransform.toMatrix(this._helpMatrix);
                            this._helpMatrix.invert();
                            this._helpMatrix.transformPoint(frame.transform.x, frame.transform.y, frame.transform);
                            frame.transform.rotation -= this._helpTransform.rotation;
                        }
                        else {
                            frame.transform.add(timeline.originTransform);
                        }
                    }
                    keyFrames.length = 0;
                    for (var i_6 = 0, l_4 = timeline.frames.length; i_6 < l_4; ++i_6) {
                        var frame = timeline.frames[i_6];
                        if (keyFrames.indexOf(frame) >= 0) {
                            continue;
                        }
                        keyFrames.push(frame);
                        frame.transform.minus(timeline.bone.transform);
                        if (i_6 == 0) {
                            timeline.originTransform.copyFrom(frame.transform);
                            frame.transform.identity();
                        }
                        else {
                            frame.transform.minus(timeline.originTransform);
                        }
                    }
                }
            }
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#parseDragonBonesData()
         */
        DataParser.parseDragonBonesData = function (rawData) {
            return dragonBones.ObjectDataParser.getInstance().parseDragonBonesData(rawData);
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#parsetTextureAtlasData()
         */
        DataParser.parseTextureAtlasData = function (rawData, scale) {
            if (scale === void 0) { scale = 1; }
            var textureAtlasData = {};
            var subTextureList = rawData[DataParser.SUB_TEXTURE];
            for (var i = 0, len = subTextureList.length; i < len; i++) {
                var subTextureObject = subTextureList[i];
                var subTextureName = subTextureObject[DataParser.NAME];
                var subTextureRegion = new dragonBones.Rectangle();
                var subTextureFrame = null;
                subTextureRegion.x = subTextureObject[DataParser.X] / scale;
                subTextureRegion.y = subTextureObject[DataParser.Y] / scale;
                subTextureRegion.width = subTextureObject[DataParser.WIDTH] / scale;
                subTextureRegion.height = subTextureObject[DataParser.HEIGHT] / scale;
                if (DataParser.FRAME_WIDTH in subTextureObject) {
                    subTextureFrame = new dragonBones.Rectangle();
                    subTextureFrame.x = subTextureObject[DataParser.FRAME_X] / scale;
                    subTextureFrame.y = subTextureObject[DataParser.FRAME_Y] / scale;
                    subTextureFrame.width = subTextureObject[DataParser.FRAME_WIDTH] / scale;
                    subTextureFrame.height = subTextureObject[DataParser.FRAME_HEIGHT] / scale;
                }
                textureAtlasData[subTextureName] = { region: subTextureRegion, frame: subTextureFrame, rotated: false };
            }
            return textureAtlasData;
        };
        DataParser.DATA_VERSION_2_3 = "2.3";
        DataParser.DATA_VERSION_3_0 = "3.0";
        DataParser.DATA_VERSION_4_0 = "4.0";
        DataParser.DATA_VERSION = "4.5";
        DataParser.TEXTURE_ATLAS = "TextureAtlas";
        DataParser.SUB_TEXTURE = "SubTexture";
        DataParser.FORMAT = "format";
        DataParser.IMAGE_PATH = "imagePath";
        DataParser.WIDTH = "width";
        DataParser.HEIGHT = "height";
        DataParser.ROTATED = "rotated";
        DataParser.FRAME_X = "frameX";
        DataParser.FRAME_Y = "frameY";
        DataParser.FRAME_WIDTH = "frameWidth";
        DataParser.FRAME_HEIGHT = "frameHeight";
        DataParser.DRADON_BONES = "dragonBones";
        DataParser.ARMATURE = "armature";
        DataParser.BONE = "bone";
        DataParser.IK = "ik";
        DataParser.SLOT = "slot";
        DataParser.SKIN = "skin";
        DataParser.DISPLAY = "display";
        DataParser.ANIMATION = "animation";
        DataParser.FFD = "ffd";
        DataParser.FRAME = "frame";
        DataParser.PIVOT = "pivot";
        DataParser.TRANSFORM = "transform";
        DataParser.COLOR = "color";
        DataParser.FILTER = "filter";
        DataParser.VERSION = "version";
        DataParser.IS_GLOBAL = "isGlobal";
        DataParser.FRAME_RATE = "frameRate";
        DataParser.TYPE = "type";
        DataParser.NAME = "name";
        DataParser.PARENT = "parent";
        DataParser.LENGTH = "length";
        DataParser.DATA = "data";
        DataParser.DISPLAY_INDEX = "displayIndex";
        DataParser.Z_ORDER = "z";
        DataParser.BLEND_MODE = "blendMode";
        DataParser.INHERIT_TRANSLATION = "inheritTranslation";
        DataParser.INHERIT_ROTATION = "inheritRotation";
        DataParser.INHERIT_SCALE = "inheritScale";
        DataParser.TARGET = "target";
        DataParser.BEND_POSITIVE = "bendPositive";
        DataParser.CHAIN = "chain";
        DataParser.WEIGHT = "weight";
        DataParser.FADE_IN_TIME = "fadeInTime";
        DataParser.PLAY_TIMES = "playTimes";
        DataParser.SCALE = "scale";
        DataParser.OFFSET = "offset";
        DataParser.POSITION = "position";
        DataParser.DURATION = "duration";
        DataParser.TWEEN_EASING = "tweenEasing";
        DataParser.TWEEN_ROTATE = "tweenRotate";
        DataParser.TWEEN_SCALE = "tweenScale";
        DataParser.CURVE = "curve";
        DataParser.EVENT = "event";
        DataParser.SOUND = "sound";
        DataParser.ACTION = "action";
        DataParser.ACTIONS = "actions";
        DataParser.DEFAULT_ACTIONS = "defaultActions";
        DataParser.X = "x";
        DataParser.Y = "y";
        DataParser.SKEW_X = "skX";
        DataParser.SKEW_Y = "skY";
        DataParser.SCALE_X = "scX";
        DataParser.SCALE_Y = "scY";
        DataParser.ALPHA_OFFSET = "aO";
        DataParser.RED_OFFSET = "rO";
        DataParser.GREEN_OFFSET = "gO";
        DataParser.BLUE_OFFSET = "bO";
        DataParser.ALPHA_MULTIPLIER = "aM";
        DataParser.RED_MULTIPLIER = "rM";
        DataParser.GREEN_MULTIPLIER = "gM";
        DataParser.BLUE_MULTIPLIER = "bM";
        DataParser.UVS = "uvs";
        DataParser.VERTICES = "vertices";
        DataParser.TRIANGLES = "triangles";
        DataParser.WEIGHTS = "weights";
        DataParser.SLOT_POSE = "slotPose";
        DataParser.BONE_POSE = "bonePose";
        DataParser.TWEEN = "tween";
        DataParser.KEY = "key";
        DataParser.COLOR_TRANSFORM = "colorTransform";
        DataParser.TIMELINE = "timeline";
        DataParser.PIVOT_X = "pX";
        DataParser.PIVOT_Y = "pY";
        DataParser.LOOP = "loop";
        DataParser.AUTO_TWEEN = "autoTween";
        DataParser.HIDE = "hide";
        DataParser.RECTANGLE = "rectangle";
        DataParser.ELLIPSE = "ellipse";
        return DataParser;
    }());
    dragonBones.DataParser = DataParser;
    egret.registerClass(DataParser,'dragonBones.DataParser');
})(dragonBones || (dragonBones = {}));
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var ObjectDataParser = (function (_super) {
        __extends(ObjectDataParser, _super);
        /**
         * @private
         */
        function ObjectDataParser() {
            _super.call(this);
        }
        var d = __define,c=ObjectDataParser,p=c.prototype;
        /**
         * @private
         */
        ObjectDataParser._getBoolean = function (rawData, key, defaultValue) {
            if (key in rawData) {
                var value = rawData[key];
                var valueType = typeof value;
                if (valueType == "boolean") {
                    return value;
                }
                else if (valueType == "string") {
                    switch (value) {
                        case "0":
                        case "NaN":
                        case "":
                        case "false":
                        case "null":
                        case "undefined":
                            return false;
                        default:
                            return true;
                    }
                }
                else {
                    return Boolean(value);
                }
            }
            return defaultValue;
        };
        /**
         * @private
         */
        ObjectDataParser._getNumber = function (rawData, key, defaultValue) {
            if (key in rawData) {
                var value = rawData[key];
                if (value == null || value == "NaN") {
                    return defaultValue;
                }
                return Number(value);
            }
            return defaultValue;
        };
        /**
         * @private
         */
        ObjectDataParser._getString = function (rawData, key, defaultValue) {
            if (key in rawData) {
                return String(rawData[key]);
            }
            return defaultValue;
        };
        /**
         * @private
         */
        ObjectDataParser._getParameter = function (rawData, index, defaultValue) {
            if (rawData && rawData.length > index) {
                return rawData[index];
            }
            return defaultValue;
        };
        /**
         * @private
         */
        p._parseArmature = function (rawData) {
            var armature = dragonBones.BaseObject.borrowObject(dragonBones.ArmatureData);
            armature.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, null);
            armature.frameRate = ObjectDataParser._getNumber(rawData, ObjectDataParser.FRAME_RATE, this._data.frameRate) || this._data.frameRate;
            if (ObjectDataParser.TYPE in rawData && typeof rawData[ObjectDataParser.TYPE] == "string") {
                armature.type = ObjectDataParser._getArmatureType(rawData[ObjectDataParser.TYPE]);
            }
            else {
                armature.type = ObjectDataParser._getNumber(rawData, ObjectDataParser.TYPE, 0 /* Armature */);
            }
            this._armature = armature;
            this._rawBones.length = 0;
            if (ObjectDataParser.BONE in rawData) {
                var bones = rawData[ObjectDataParser.BONE];
                for (var i = 0, l = bones.length; i < l; ++i) {
                    var boneObject = bones[i];
                    var bone = this._parseBone(boneObject);
                    armature.addBone(bone, ObjectDataParser._getString(boneObject, ObjectDataParser.PARENT, null));
                    this._rawBones.push(bone);
                }
            }
            if (ObjectDataParser.IK in rawData) {
                var iks = rawData[ObjectDataParser.IK];
                for (var i = 0, l = iks.length; i < l; ++i) {
                    this._parseIK(iks[i]);
                }
            }
            if (ObjectDataParser.SLOT in rawData) {
                var slots = rawData[ObjectDataParser.SLOT];
                for (var i = 0, l = slots.length; i < l; ++i) {
                    armature.addSlot(this._parseSlot(slots[i]));
                }
            }
            if (ObjectDataParser.SKIN in rawData) {
                var skins = rawData[ObjectDataParser.SKIN];
                for (var i = 0, l = skins.length; i < l; ++i) {
                    armature.addSkin(this._parseSkin(skins[i]));
                }
            }
            if (ObjectDataParser.ANIMATION in rawData) {
                var animations = rawData[ObjectDataParser.ANIMATION];
                for (var i = 0, l = animations.length; i < l; ++i) {
                    armature.addAnimation(this._parseAnimation(animations[i]));
                }
            }
            if ((ObjectDataParser.ACTIONS in rawData) ||
                (ObjectDataParser.DEFAULT_ACTIONS in rawData)) {
                this._parseActionData(rawData, armature.actions, null, null);
            }
            if (this._isParentCooriinate && ObjectDataParser._getBoolean(rawData, ObjectDataParser.IS_GLOBAL, true)) {
                this._globalToLocal(armature);
            }
            this._armature = null;
            this._rawBones.length = 0;
            return armature;
        };
        /**
         * @private
         */
        p._parseBone = function (rawData) {
            var bone = dragonBones.BaseObject.borrowObject(dragonBones.BoneData);
            bone.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, null);
            bone.inheritTranslation = ObjectDataParser._getBoolean(rawData, ObjectDataParser.INHERIT_TRANSLATION, true);
            bone.inheritRotation = ObjectDataParser._getBoolean(rawData, ObjectDataParser.INHERIT_ROTATION, true);
            bone.inheritScale = ObjectDataParser._getBoolean(rawData, ObjectDataParser.INHERIT_SCALE, true);
            bone.length = ObjectDataParser._getNumber(rawData, ObjectDataParser.LENGTH, 0) * this._armatureScale;
            if (ObjectDataParser.TRANSFORM in rawData) {
                this._parseTransform(rawData[ObjectDataParser.TRANSFORM], bone.transform);
            }
            if (this._isParentCooriinate) {
                bone.inheritRotation = true;
                bone.inheritScale = false;
            }
            return bone;
        };
        /**
         * @private
         */
        p._parseIK = function (rawData) {
            var bone = this._armature.getBone(ObjectDataParser._getString(rawData, (ObjectDataParser.BONE in rawData) ? ObjectDataParser.BONE : ObjectDataParser.NAME, null));
            if (bone) {
                bone.ik = this._armature.getBone(ObjectDataParser._getString(rawData, ObjectDataParser.TARGET, null));
                bone.bendPositive = ObjectDataParser._getBoolean(rawData, ObjectDataParser.BEND_POSITIVE, true);
                bone.chain = ObjectDataParser._getNumber(rawData, ObjectDataParser.CHAIN, 0);
                bone.weight = ObjectDataParser._getNumber(rawData, ObjectDataParser.WEIGHT, 1);
                if (bone.chain > 0 && bone.parent && !bone.parent.ik) {
                    bone.parent.ik = bone.ik;
                    bone.parent.chainIndex = 0;
                    bone.parent.chain = 0;
                    bone.chainIndex = 1;
                }
                else {
                    bone.chain = 0;
                    bone.chainIndex = 0;
                }
            }
        };
        /**
         * @private
         */
        p._parseSlot = function (rawData) {
            var slot = dragonBones.BaseObject.borrowObject(dragonBones.SlotData);
            slot.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, null);
            slot.parent = this._armature.getBone(ObjectDataParser._getString(rawData, ObjectDataParser.PARENT, null));
            slot.displayIndex = ObjectDataParser._getNumber(rawData, ObjectDataParser.DISPLAY_INDEX, 0);
            slot.zOrder = ObjectDataParser._getNumber(rawData, ObjectDataParser.Z_ORDER, this._armature.sortedSlots.length); // TODO zOrder.
            if (ObjectDataParser.COLOR in rawData) {
                slot.color = dragonBones.SlotData.generateColor();
                this._parseColorTransform(rawData[ObjectDataParser.COLOR], slot.color);
            }
            else {
                slot.color = dragonBones.SlotData.DEFAULT_COLOR;
            }
            if (ObjectDataParser.BLEND_MODE in rawData && typeof rawData[ObjectDataParser.BLEND_MODE] == "string") {
                slot.blendMode = ObjectDataParser._getBlendMode(rawData[ObjectDataParser.BLEND_MODE]);
            }
            else {
                slot.blendMode = ObjectDataParser._getNumber(rawData, ObjectDataParser.BLEND_MODE, 0 /* Normal */);
            }
            if ((ObjectDataParser.ACTIONS in rawData) ||
                (ObjectDataParser.DEFAULT_ACTIONS in rawData)) {
                this._parseActionData(rawData, slot.actions, null, null);
            }
            if (this._isParentCooriinate) {
                if (ObjectDataParser.COLOR_TRANSFORM in rawData) {
                    slot.color = dragonBones.SlotData.generateColor();
                    this._parseColorTransform(rawData[ObjectDataParser.COLOR_TRANSFORM], slot.color);
                }
                else {
                    slot.color = dragonBones.SlotData.DEFAULT_COLOR;
                }
            }
            return slot;
        };
        /**
         * @private
         */
        p._parseSkin = function (rawData) {
            var skin = dragonBones.BaseObject.borrowObject(dragonBones.SkinData);
            skin.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, "__default") || "__default";
            if (ObjectDataParser.SLOT in rawData) {
                this._skin = skin;
                var slots = rawData[ObjectDataParser.SLOT];
                for (var i = 0, l = slots.length; i < l; ++i) {
                    if (this._isParentCooriinate) {
                        this._armature.addSlot(this._parseSlot(slots[i]));
                    }
                    skin.addSlot(this._parseSlotDisplaySet(slots[i]));
                }
                this._skin = null;
            }
            return skin;
        };
        /**
         * @private
         */
        p._parseSlotDisplaySet = function (rawData) {
            var slotDisplayDataSet = dragonBones.BaseObject.borrowObject(dragonBones.SlotDisplayDataSet);
            slotDisplayDataSet.slot = this._armature.getSlot(ObjectDataParser._getString(rawData, ObjectDataParser.NAME, null));
            if (ObjectDataParser.DISPLAY in rawData) {
                var displayObjectSet = rawData[ObjectDataParser.DISPLAY];
                var displayDataSet = slotDisplayDataSet.displays;
                this._slotDisplayDataSet = slotDisplayDataSet;
                for (var i = 0, l = displayObjectSet.length; i < l; ++i) {
                    displayDataSet.push(this._parseDisplay(displayObjectSet[i]));
                }
                this._slotDisplayDataSet = null;
            }
            return slotDisplayDataSet;
        };
        /**
         * @private
         */
        p._parseDisplay = function (rawData) {
            var display = dragonBones.BaseObject.borrowObject(dragonBones.DisplayData);
            display.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, null);
            if (ObjectDataParser.TYPE in rawData && typeof rawData[ObjectDataParser.TYPE] == "string") {
                display.type = ObjectDataParser._getDisplayType(rawData[ObjectDataParser.TYPE]);
            }
            else {
                display.type = ObjectDataParser._getNumber(rawData, ObjectDataParser.TYPE, 0 /* Image */);
            }
            display.isRelativePivot = true;
            if (ObjectDataParser.PIVOT in rawData) {
                var pivotObject = rawData[ObjectDataParser.PIVOT];
                display.pivot.x = ObjectDataParser._getNumber(pivotObject, ObjectDataParser.X, 0);
                display.pivot.y = ObjectDataParser._getNumber(pivotObject, ObjectDataParser.Y, 0);
            }
            else if (this._isParentCooriinate) {
                var transformObject = rawData[ObjectDataParser.TRANSFORM];
                display.isRelativePivot = false;
                display.pivot.x = ObjectDataParser._getNumber(transformObject, ObjectDataParser.PIVOT_X, 0) * this._armatureScale;
                display.pivot.y = ObjectDataParser._getNumber(transformObject, ObjectDataParser.PIVOT_Y, 0) * this._armatureScale;
            }
            else {
                display.pivot.x = 0.5;
                display.pivot.y = 0.5;
            }
            if (ObjectDataParser.TRANSFORM in rawData) {
                this._parseTransform(rawData[ObjectDataParser.TRANSFORM], display.transform);
            }
            switch (display.type) {
                case 0 /* Image */:
                    break;
                case 1 /* Armature */:
                    break;
                case 2 /* Mesh */:
                    display.meshData = this._parseMesh(rawData);
                    break;
            }
            return display;
        };
        /**
         * @private
         */
        p._parseMesh = function (rawData) {
            var mesh = dragonBones.BaseObject.borrowObject(dragonBones.MeshData);
            var rawVertices = rawData[ObjectDataParser.VERTICES];
            var rawUVs = rawData[ObjectDataParser.UVS];
            var rawTriangles = rawData[ObjectDataParser.TRIANGLES];
            var numVertices = Math.floor(rawVertices.length / 2); // uint()
            var numTriangles = Math.floor(rawTriangles.length / 3); // uint()
            var inverseBindPose = new Array(this._armature.sortedBones.length);
            mesh.skinned = (ObjectDataParser.WEIGHTS in rawData) && rawData[ObjectDataParser.WEIGHTS].length > 0;
            mesh.uvs.length = numVertices * 2;
            mesh.vertices.length = numVertices * 2;
            mesh.vertexIndices.length = numTriangles * 3;
            if (mesh.skinned) {
                mesh.boneIndices.length = numVertices;
                mesh.weights.length = numVertices;
                mesh.boneVertices.length = numVertices;
                if (ObjectDataParser.SLOT_POSE in rawData) {
                    var rawSlotPose = rawData[ObjectDataParser.SLOT_POSE];
                    mesh.slotPose.a = rawSlotPose[0];
                    mesh.slotPose.b = rawSlotPose[1];
                    mesh.slotPose.c = rawSlotPose[2];
                    mesh.slotPose.d = rawSlotPose[3];
                    mesh.slotPose.tx = rawSlotPose[4];
                    mesh.slotPose.ty = rawSlotPose[5];
                }
                if (ObjectDataParser.BONE_POSE in rawData) {
                    var rawBonePose = rawData[ObjectDataParser.BONE_POSE];
                    for (var i = 0, l = rawBonePose.length; i < l; i += 7) {
                        var rawBoneIndex = rawBonePose[i];
                        var boneMatrix = inverseBindPose[rawBoneIndex] = new dragonBones.Matrix();
                        boneMatrix.a = rawBonePose[i + 1];
                        boneMatrix.b = rawBonePose[i + 2];
                        boneMatrix.c = rawBonePose[i + 3];
                        boneMatrix.d = rawBonePose[i + 4];
                        boneMatrix.tx = rawBonePose[i + 5];
                        boneMatrix.ty = rawBonePose[i + 6];
                        boneMatrix.invert();
                    }
                }
            }
            for (var i = 0, iW = 0, l = rawVertices.length; i < l; i += 2) {
                var iN = i + 1;
                var vertexIndex = i / 2;
                var x = mesh.vertices[i] = rawVertices[i] * this._armatureScale;
                var y = mesh.vertices[iN] = rawVertices[iN] * this._armatureScale;
                mesh.uvs[i] = rawUVs[i];
                mesh.uvs[iN] = rawUVs[iN];
                if (mesh.skinned) {
                    var rawWeights = rawData[ObjectDataParser.WEIGHTS];
                    var numBones = rawWeights[iW];
                    var indices = mesh.boneIndices[vertexIndex] = new Array(numBones);
                    var weights = mesh.weights[vertexIndex] = new Array(numBones);
                    var boneVertices = mesh.boneVertices[vertexIndex] = new Array(numBones * 2);
                    mesh.slotPose.transformPoint(x, y, this._helpPoint);
                    x = mesh.vertices[i] = this._helpPoint.x;
                    y = mesh.vertices[iN] = this._helpPoint.y;
                    for (var iB = 0; iB < numBones; ++iB) {
                        var iI = iW + 1 + iB * 2;
                        var rawBoneIndex = rawWeights[iI];
                        var boneData = this._rawBones[rawBoneIndex];
                        var boneIndex = mesh.bones.indexOf(boneData);
                        if (boneIndex < 0) {
                            boneIndex = mesh.bones.length;
                            mesh.bones[boneIndex] = boneData;
                            mesh.inverseBindPose[boneIndex] = inverseBindPose[rawBoneIndex];
                        }
                        mesh.inverseBindPose[boneIndex].transformPoint(x, y, this._helpPoint);
                        indices[iB] = boneIndex;
                        weights[iB] = rawWeights[iI + 1];
                        boneVertices[iB * 2] = this._helpPoint.x;
                        boneVertices[iB * 2 + 1] = this._helpPoint.y;
                    }
                    iW += numBones * 2 + 1;
                }
            }
            for (var i = 0, l = rawTriangles.length; i < l; ++i) {
                mesh.vertexIndices[i] = rawTriangles[i];
            }
            return mesh;
        };
        /**
         * @private
         */
        p._parseAnimation = function (rawData) {
            var animation = dragonBones.BaseObject.borrowObject(dragonBones.AnimationData);
            animation.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, "__default") || "__default";
            animation.frameCount = Math.max(ObjectDataParser._getNumber(rawData, ObjectDataParser.DURATION, 1), 1);
            animation.position = ObjectDataParser._getNumber(rawData, ObjectDataParser.POSITION, 0) / this._armature.frameRate;
            animation.duration = animation.frameCount / this._armature.frameRate;
            animation.playTimes = ObjectDataParser._getNumber(rawData, ObjectDataParser.PLAY_TIMES, 1);
            animation.fadeInTime = ObjectDataParser._getNumber(rawData, ObjectDataParser.FADE_IN_TIME, 0);
            this._animation = animation;
            var animationName = ObjectDataParser._getString(rawData, ObjectDataParser.ANIMATION, null);
            if (animationName) {
                animation.animation = this._armature.getAnimation(animationName);
                if (!animation.animation) {
                }
                return animation;
            }
            this._parseTimeline(rawData, animation, this._parseAnimationFrame);
            if (ObjectDataParser.BONE in rawData) {
                var boneTimelines = rawData[ObjectDataParser.BONE];
                for (var i = 0, l = boneTimelines.length; i < l; ++i) {
                    animation.addBoneTimeline(this._parseBoneTimeline(boneTimelines[i]));
                }
            }
            if (ObjectDataParser.SLOT in rawData) {
                var slotTimelines = rawData[ObjectDataParser.SLOT];
                for (var i = 0, l = slotTimelines.length; i < l; ++i) {
                    animation.addSlotTimeline(this._parseSlotTimeline(slotTimelines[i]));
                }
            }
            if (ObjectDataParser.FFD in rawData) {
                var ffdTimelines = rawData[ObjectDataParser.FFD];
                for (var i = 0, l = ffdTimelines.length; i < l; ++i) {
                    animation.addFFDTimeline(this._parseFFDTimeline(ffdTimelines[i]));
                }
            }
            if (this._isParentCooriinate) {
                this._isAutoTween = ObjectDataParser._getBoolean(rawData, ObjectDataParser.AUTO_TWEEN, true);
                this._animationTweenEasing = ObjectDataParser._getNumber(rawData, ObjectDataParser.TWEEN_EASING, 0) || 0;
                animation.playTimes = ObjectDataParser._getNumber(rawData, ObjectDataParser.LOOP, 1);
                if (ObjectDataParser.TIMELINE in rawData) {
                    var timelines = rawData[ObjectDataParser.TIMELINE];
                    for (var i = 0, l = timelines.length; i < l; ++i) {
                        animation.addBoneTimeline(this._parseBoneTimeline(timelines[i]));
                    }
                    for (var i = 0, l = timelines.length; i < l; ++i) {
                        animation.addSlotTimeline(this._parseSlotTimeline(timelines[i]));
                    }
                }
            }
            else {
                this._isAutoTween = false;
                this._animationTweenEasing = 0;
            }
            for (var i in this._armature.bones) {
                var bone = this._armature.bones[i];
                if (!animation.getBoneTimeline(bone.name)) {
                    var boneTimeline = dragonBones.BaseObject.borrowObject(dragonBones.BoneTimelineData);
                    var boneFrame = dragonBones.BaseObject.borrowObject(dragonBones.BoneFrameData);
                    boneTimeline.bone = bone;
                    boneTimeline.frames[0] = boneFrame;
                    animation.addBoneTimeline(boneTimeline);
                }
            }
            for (var i in this._armature.slots) {
                var slot = this._armature.slots[i];
                if (!animation.getSlotTimeline(slot.name)) {
                    var slotTimeline = dragonBones.BaseObject.borrowObject(dragonBones.SlotTimelineData);
                    var slotFrame = dragonBones.BaseObject.borrowObject(dragonBones.SlotFrameData);
                    slotTimeline.slot = slot;
                    slotFrame.displayIndex = slot.displayIndex;
                    //slotFrame.zOrder = -2; // TODO zOrder.
                    if (slot.color == dragonBones.SlotData.DEFAULT_COLOR) {
                        slotFrame.color = dragonBones.SlotFrameData.DEFAULT_COLOR;
                    }
                    else {
                        slotFrame.color = dragonBones.SlotFrameData.generateColor();
                        slotFrame.color.copyFrom(slot.color);
                    }
                    slotTimeline.frames[0] = slotFrame;
                    animation.addSlotTimeline(slotTimeline);
                    if (this._isParentCooriinate) {
                        slotFrame.displayIndex = -1;
                    }
                }
            }
            this._animation = null;
            return animation;
        };
        /**
         * @private
         */
        p._parseBoneTimeline = function (rawData) {
            var timeline = dragonBones.BaseObject.borrowObject(dragonBones.BoneTimelineData);
            timeline.bone = this._armature.getBone(ObjectDataParser._getString(rawData, ObjectDataParser.NAME, null));
            this._parseTimeline(rawData, timeline, this._parseBoneFrame);
            var originTransform = timeline.originTransform;
            var prevFrame = null;
            for (var i = 0, l = timeline.frames.length; i < l; ++i) {
                var frame = timeline.frames[i];
                if (!prevFrame) {
                    originTransform.copyFrom(frame.transform);
                    frame.transform.identity();
                    if (originTransform.scaleX == 0) {
                        originTransform.scaleX = 0.001;
                    }
                    if (originTransform.scaleY == 0) {
                        originTransform.scaleY = 0.001;
                    }
                }
                else if (prevFrame != frame) {
                    frame.transform.minus(originTransform);
                }
                prevFrame = frame;
            }
            if (timeline.scale != 1 || timeline.offset != 0) {
                this._animation.hasAsynchronyTimeline = true;
            }
            return timeline;
        };
        /**
         * @private
         */
        p._parseSlotTimeline = function (rawData) {
            var timeline = dragonBones.BaseObject.borrowObject(dragonBones.SlotTimelineData);
            timeline.slot = this._armature.getSlot(ObjectDataParser._getString(rawData, ObjectDataParser.NAME, null));
            this._parseTimeline(rawData, timeline, this._parseSlotFrame);
            if (timeline.scale != 1 || timeline.offset != 0) {
                this._animation.hasAsynchronyTimeline = true;
            }
            return timeline;
        };
        /**
         * @private
         */
        p._parseFFDTimeline = function (rawData) {
            var timeline = dragonBones.BaseObject.borrowObject(dragonBones.FFDTimelineData);
            timeline.skin = this._armature.getSkin(ObjectDataParser._getString(rawData, ObjectDataParser.SKIN, null));
            timeline.slot = timeline.skin.getSlot(ObjectDataParser._getString(rawData, ObjectDataParser.SLOT, null)); // NAME;
            var meshName = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, null);
            for (var i = 0, l = timeline.slot.displays.length; i < l; ++i) {
                var displayData = timeline.slot.displays[i];
                if (displayData.meshData && displayData.name == meshName) {
                    timeline.displayIndex = i; // rawData[DISPLAY_INDEX];
                    this._mesh = displayData.meshData; // Find the ffd's mesh.
                    break;
                }
            }
            this._parseTimeline(rawData, timeline, this._parseFFDFrame);
            this._mesh = null;
            return timeline;
        };
        /**
         * @private
         */
        p._parseAnimationFrame = function (rawData, frameStart, frameCount) {
            var frame = dragonBones.BaseObject.borrowObject(dragonBones.AnimationFrameData);
            this._parseFrame(rawData, frame, frameStart, frameCount);
            if ((ObjectDataParser.ACTION in rawData) ||
                (ObjectDataParser.ACTIONS in rawData)) {
                this._parseActionData(rawData, frame.actions, null, null);
            }
            if ((ObjectDataParser.EVENT in rawData) || (ObjectDataParser.SOUND in rawData)) {
                this._parseEventData(rawData, frame.events, null, null);
            }
            return frame;
        };
        /**
         * @private
         */
        p._parseBoneFrame = function (rawData, frameStart, frameCount) {
            var frame = dragonBones.BaseObject.borrowObject(dragonBones.BoneFrameData);
            frame.tweenRotate = ObjectDataParser._getNumber(rawData, ObjectDataParser.TWEEN_ROTATE, 0);
            frame.tweenScale = ObjectDataParser._getBoolean(rawData, ObjectDataParser.TWEEN_SCALE, true);
            this._parseTweenFrame(rawData, frame, frameStart, frameCount);
            if (ObjectDataParser.TRANSFORM in rawData) {
                var transformObject = rawData[ObjectDataParser.TRANSFORM];
                this._parseTransform(transformObject, frame.transform);
                if (this._isParentCooriinate) {
                    this._helpPoint.x = ObjectDataParser._getNumber(transformObject, ObjectDataParser.PIVOT_X, 0);
                    this._helpPoint.y = ObjectDataParser._getNumber(transformObject, ObjectDataParser.PIVOT_Y, 0);
                    frame.transform.toMatrix(this._helpMatrix);
                    this._helpMatrix.transformPoint(this._helpPoint.x, this._helpPoint.y, this._helpPoint, true);
                    frame.transform.x += this._helpPoint.x;
                    frame.transform.y += this._helpPoint.y;
                }
            }
            var bone = this._timeline.bone;
            if ((ObjectDataParser.ACTION in rawData) ||
                (ObjectDataParser.ACTIONS in rawData)) {
                var slot = this._armature.getSlot(bone.name);
                var actions = [];
                this._parseActionData(rawData, actions, bone, slot);
                this._mergeFrameToAnimationTimeline(frame, actions, null); // Merge actions and events to animation timeline.
            }
            if ((ObjectDataParser.EVENT in rawData) || (ObjectDataParser.SOUND in rawData)) {
                var events = [];
                this._parseEventData(rawData, events, bone, null);
                this._mergeFrameToAnimationTimeline(frame, null, events); // Merge actions and events to animation timeline.
            }
            return frame;
        };
        /**
         * @private
         */
        p._parseSlotFrame = function (rawData, frameStart, frameCount) {
            var frame = dragonBones.BaseObject.borrowObject(dragonBones.SlotFrameData);
            frame.displayIndex = ObjectDataParser._getNumber(rawData, ObjectDataParser.DISPLAY_INDEX, 0);
            //frame.zOrder = _getNumber(rawData, Z_ORDER, -1); // TODO zorder
            this._parseTweenFrame(rawData, frame, frameStart, frameCount);
            if (ObjectDataParser.COLOR in rawData || ObjectDataParser.COLOR_TRANSFORM in rawData) {
                frame.color = dragonBones.SlotFrameData.generateColor();
                this._parseColorTransform(rawData[ObjectDataParser.COLOR] || rawData[ObjectDataParser.COLOR_TRANSFORM], frame.color);
            }
            else {
                frame.color = dragonBones.SlotFrameData.DEFAULT_COLOR;
            }
            if (this._isParentCooriinate) {
                if (ObjectDataParser._getBoolean(rawData, ObjectDataParser.HIDE, false)) {
                    frame.displayIndex = -1;
                }
            }
            else if ((ObjectDataParser.ACTION in rawData) ||
                (ObjectDataParser.ACTIONS in rawData)) {
                var slot = this._timeline.slot;
                var actions = [];
                this._parseActionData(rawData, actions, slot.parent, slot);
                this._mergeFrameToAnimationTimeline(frame, actions, null); // Merge actions and events to animation timeline.
            }
            return frame;
        };
        /**
         * @private
         */
        p._parseFFDFrame = function (rawData, frameStart, frameCount) {
            var frame = dragonBones.BaseObject.borrowObject(dragonBones.ExtensionFrameData);
            frame.type = ObjectDataParser._getNumber(rawData, ObjectDataParser.TYPE, 0 /* FFD */);
            this._parseTweenFrame(rawData, frame, frameStart, frameCount);
            var rawVertices = rawData[ObjectDataParser.VERTICES];
            var offset = ObjectDataParser._getNumber(rawData, ObjectDataParser.OFFSET, 0);
            var x = 0;
            var y = 0;
            for (var i = 0, l = this._mesh.vertices.length; i < l; i += 2) {
                if (!rawVertices || i < offset || i - offset >= rawVertices.length) {
                    x = 0;
                    y = 0;
                }
                else {
                    x = rawVertices[i - offset] * this._armatureScale;
                    y = rawVertices[i + 1 - offset] * this._armatureScale;
                }
                if (this._mesh.skinned) {
                    this._mesh.slotPose.transformPoint(x, y, this._helpPoint, true);
                    x = this._helpPoint.x;
                    y = this._helpPoint.y;
                    var boneIndices = this._mesh.boneIndices[i / 2];
                    for (var iB = 0, lB = boneIndices.length; iB < lB; ++iB) {
                        var boneIndex = boneIndices[iB];
                        this._mesh.inverseBindPose[boneIndex].transformPoint(x, y, this._helpPoint, true);
                        frame.tweens.push(this._helpPoint.x, this._helpPoint.y);
                    }
                }
                else {
                    frame.tweens.push(x, y);
                }
            }
            return frame;
        };
        /**
         * @private
         */
        p._parseTweenFrame = function (rawData, frame, frameStart, frameCount) {
            this._parseFrame(rawData, frame, frameStart, frameCount);
            if (ObjectDataParser.TWEEN_EASING in rawData) {
                frame.tweenEasing = ObjectDataParser._getNumber(rawData, ObjectDataParser.TWEEN_EASING, dragonBones.DragonBones.NO_TWEEN);
            }
            else if (this._isParentCooriinate) {
                frame.tweenEasing = this._isAutoTween ? this._animationTweenEasing : dragonBones.DragonBones.NO_TWEEN;
            }
            if (this._isParentCooriinate && this._animation.scale == 1 && this._timeline.scale == 1 && frame.duration * this._armature.frameRate < 2) {
                frame.tweenEasing = dragonBones.DragonBones.NO_TWEEN;
            }
            if (ObjectDataParser.CURVE in rawData) {
                frame.curve = dragonBones.TweenFrameData.samplingCurve(rawData[ObjectDataParser.CURVE], frameCount);
            }
        };
        /**
         * @private
         */
        p._parseFrame = function (rawData, frame, frameStart, frameCount) {
            frame.position = frameStart / this._armature.frameRate;
            frame.duration = frameCount / this._armature.frameRate;
        };
        /**
         * @private
         */
        p._parseTimeline = function (rawData, timeline, frameParser) {
            timeline.scale = ObjectDataParser._getNumber(rawData, ObjectDataParser.SCALE, 1);
            timeline.offset = ObjectDataParser._getNumber(rawData, ObjectDataParser.OFFSET, 0);
            this._timeline = timeline;
            if (ObjectDataParser.FRAME in rawData) {
                var rawFrames = rawData[ObjectDataParser.FRAME];
                if (rawFrames.length) {
                    if (rawFrames.length == 1) {
                        timeline.frames.length = 1;
                        timeline.frames[0] = frameParser.call(this, rawFrames[0], 0, ObjectDataParser._getNumber(rawFrames[0], ObjectDataParser.DURATION, 1));
                    }
                    else {
                        timeline.frames.length = this._animation.frameCount + 1;
                        var frameStart = 0;
                        var frameCount = 0;
                        var frame = null;
                        var prevFrame = null;
                        for (var i = 0, iW = 0, l = this._animation.frameCount + 1; i < l; ++i) {
                            if (frameStart + frameCount <= i && iW < rawFrames.length) {
                                var frameObject = rawFrames[iW++];
                                frameStart = i;
                                frameCount = ObjectDataParser._getNumber(frameObject, ObjectDataParser.DURATION, 1);
                                frame = frameParser.call(this, frameObject, frameStart, frameCount);
                                if (prevFrame) {
                                    prevFrame.next = frame;
                                    frame.prev = prevFrame;
                                    if (this._isParentCooriinate) {
                                        if (prevFrame instanceof dragonBones.TweenFrameData && frameObject[ObjectDataParser.DISPLAY_INDEX] == -1) {
                                            prevFrame.tweenEasing = dragonBones.DragonBones.NO_TWEEN;
                                        }
                                    }
                                }
                                prevFrame = frame;
                            }
                            timeline.frames[i] = frame;
                        }
                        frame.duration = this._animation.duration - frame.position; // Modify last frame duration.
                        frame = timeline.frames[0];
                        prevFrame.next = frame;
                        frame.prev = prevFrame;
                        if (this._isParentCooriinate) {
                            if (prevFrame instanceof dragonBones.TweenFrameData && rawFrames[0][ObjectDataParser.DISPLAY_INDEX] == -1) {
                                prevFrame.tweenEasing = dragonBones.DragonBones.NO_TWEEN;
                            }
                        }
                    }
                }
            }
            this._timeline = null;
        };
        /**
         * @private
         */
        p._parseActionData = function (rawData, actions, bone, slot) {
            var actionsObject = rawData[ObjectDataParser.ACTION] || rawData[ObjectDataParser.ACTIONS] || rawData[ObjectDataParser.DEFAULT_ACTIONS];
            if (typeof actionsObject == "string") {
                var actionData = dragonBones.BaseObject.borrowObject(dragonBones.ActionData);
                actionData.type = 4 /* FadeIn */;
                actionData.data = [actionsObject, -1, -1];
                actionData.bone = bone;
                actionData.slot = slot;
                actions.push(actionData);
            }
            else if (actionsObject instanceof Array) {
                for (var i = 0, l = actionsObject.length; i < l; ++i) {
                    var actionObject = (actionsObject[i] instanceof Array ? actionsObject[i] : null);
                    var actionData = dragonBones.BaseObject.borrowObject(dragonBones.ActionData);
                    var animationName = actionObject ? null : actionsObject[i]["gotoAndPlay"];
                    if (actionObject) {
                        var actionType = actionObject[0];
                        if (typeof actionType == "string") {
                            actionData.type = ObjectDataParser._getActionType(actionType);
                        }
                        else {
                            actionData.type = ObjectDataParser._getParameter(actionObject, 0, 4 /* FadeIn */);
                        }
                    }
                    else {
                        actionData.type = 2 /* GotoAndPlay */;
                    }
                    switch (actionData.type) {
                        case 0 /* Play */:
                            actionData.data = [
                                actionObject ? ObjectDataParser._getParameter(actionObject, 1, null) : animationName,
                                ObjectDataParser._getParameter(actionObject, 2, -1),
                            ];
                            break;
                        case 1 /* Stop */:
                            actionData.data = [
                                actionObject ? ObjectDataParser._getParameter(actionObject, 1, null) : animationName,
                            ];
                            break;
                        case 2 /* GotoAndPlay */:
                            actionData.data = [
                                actionObject ? ObjectDataParser._getParameter(actionObject, 1, null) : animationName,
                                ObjectDataParser._getParameter(actionObject, 2, 0),
                                ObjectDataParser._getParameter(actionObject, 3, -1) // playTimes
                            ];
                            break;
                        case 3 /* GotoAndStop */:
                            actionData.data = [
                                actionObject ? ObjectDataParser._getParameter(actionObject, 1, null) : animationName,
                                ObjectDataParser._getParameter(actionObject, 2, 0),
                            ];
                            break;
                        case 4 /* FadeIn */:
                            actionData.data = [
                                actionObject ? ObjectDataParser._getParameter(actionObject, 1, null) : animationName,
                                ObjectDataParser._getParameter(actionObject, 2, -1),
                                ObjectDataParser._getParameter(actionObject, 3, -1) // playTimes
                            ];
                            break;
                        case 5 /* FadeOut */:
                            actionData.data = [
                                actionObject ? ObjectDataParser._getParameter(actionObject, 1, null) : animationName,
                                ObjectDataParser._getParameter(actionObject, 2, 0) // fadeOutTime
                            ];
                            break;
                    }
                    actionData.bone = bone;
                    actionData.slot = slot;
                    actions.push(actionData);
                }
            }
        };
        /**
         * @private
         */
        p._parseEventData = function (rawData, events, bone, slot) {
            if (ObjectDataParser.SOUND in rawData) {
                var soundEventData = dragonBones.BaseObject.borrowObject(dragonBones.EventData);
                soundEventData.type = 1 /* Sound */;
                soundEventData.name = rawData[ObjectDataParser.SOUND];
                soundEventData.bone = bone;
                soundEventData.slot = slot;
                events.push(soundEventData);
            }
            if (ObjectDataParser.EVENT in rawData) {
                var eventData = dragonBones.BaseObject.borrowObject(dragonBones.EventData);
                eventData.type = 0 /* Frame */;
                eventData.name = rawData[ObjectDataParser.EVENT];
                eventData.bone = bone;
                eventData.slot = slot;
                if (ObjectDataParser.DATA in rawData) {
                    eventData.data = rawData[ObjectDataParser.DATA];
                }
                events.push(eventData);
            }
        };
        /**
         * @private
         */
        p._parseTransform = function (rawData, transform) {
            transform.x = ObjectDataParser._getNumber(rawData, ObjectDataParser.X, 0) * this._armatureScale;
            transform.y = ObjectDataParser._getNumber(rawData, ObjectDataParser.Y, 0) * this._armatureScale;
            transform.skewX = ObjectDataParser._getNumber(rawData, ObjectDataParser.SKEW_X, 0) * dragonBones.DragonBones.ANGLE_TO_RADIAN;
            transform.skewY = ObjectDataParser._getNumber(rawData, ObjectDataParser.SKEW_Y, 0) * dragonBones.DragonBones.ANGLE_TO_RADIAN;
            transform.scaleX = ObjectDataParser._getNumber(rawData, ObjectDataParser.SCALE_X, 1);
            transform.scaleY = ObjectDataParser._getNumber(rawData, ObjectDataParser.SCALE_Y, 1);
        };
        /**
         * @private
         */
        p._parseColorTransform = function (rawData, color) {
            color.alphaMultiplier = ObjectDataParser._getNumber(rawData, ObjectDataParser.ALPHA_MULTIPLIER, 100) * 0.01;
            color.redMultiplier = ObjectDataParser._getNumber(rawData, ObjectDataParser.RED_MULTIPLIER, 100) * 0.01;
            color.greenMultiplier = ObjectDataParser._getNumber(rawData, ObjectDataParser.GREEN_MULTIPLIER, 100) * 0.01;
            color.blueMultiplier = ObjectDataParser._getNumber(rawData, ObjectDataParser.BLUE_MULTIPLIER, 100) * 0.01;
            color.alphaOffset = ObjectDataParser._getNumber(rawData, ObjectDataParser.ALPHA_OFFSET, 0);
            color.redOffset = ObjectDataParser._getNumber(rawData, ObjectDataParser.RED_OFFSET, 0);
            color.greenOffset = ObjectDataParser._getNumber(rawData, ObjectDataParser.GREEN_OFFSET, 0);
            color.blueOffset = ObjectDataParser._getNumber(rawData, ObjectDataParser.BLUE_OFFSET, 0);
        };
        /**
         * @inheritDoc
         */
        p.parseDragonBonesData = function (rawData, scale) {
            if (scale === void 0) { scale = 1; }
            if (rawData) {
                var version = ObjectDataParser._getString(rawData, ObjectDataParser.VERSION, null);
                this._isParentCooriinate = version == ObjectDataParser.DATA_VERSION_2_3 || version == ObjectDataParser.DATA_VERSION_3_0;
                this._armatureScale = scale;
                if (version == ObjectDataParser.DATA_VERSION ||
                    version == ObjectDataParser.DATA_VERSION_4_0 ||
                    this._isParentCooriinate) {
                    var data = dragonBones.BaseObject.borrowObject(dragonBones.DragonBonesData);
                    data.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, null);
                    data.frameRate = ObjectDataParser._getNumber(rawData, ObjectDataParser.FRAME_RATE, 24) || 24;
                    if (ObjectDataParser.ARMATURE in rawData) {
                        this._data = data;
                        var armatures = rawData[ObjectDataParser.ARMATURE];
                        for (var i = 0, l = armatures.length; i < l; ++i) {
                            data.addArmature(this._parseArmature(armatures[i]));
                        }
                        this._data = null;
                    }
                    return data;
                }
                else {
                    throw new Error("Nonsupport data version.");
                }
            }
            else {
                throw new Error();
            }
            // return null;
        };
        /**
         * @inheritDoc
         */
        p.parseTextureAtlasData = function (rawData, textureAtlasData, scale) {
            if (scale === void 0) { scale = 0; }
            if (rawData) {
                textureAtlasData.name = ObjectDataParser._getString(rawData, ObjectDataParser.NAME, null);
                textureAtlasData.imagePath = ObjectDataParser._getString(rawData, ObjectDataParser.IMAGE_PATH, null);
                // Texture format.
                if (scale > 0) {
                    textureAtlasData.scale = scale;
                }
                else {
                    scale = textureAtlasData.scale = ObjectDataParser._getNumber(rawData, ObjectDataParser.SCALE, textureAtlasData.scale);
                }
                scale = 1 / scale;
                if (ObjectDataParser.SUB_TEXTURE in rawData) {
                    var textures = rawData[ObjectDataParser.SUB_TEXTURE];
                    for (var i = 0, l = textures.length; i < l; ++i) {
                        var textureObject = textures[i];
                        var textureData = textureAtlasData.generateTextureData();
                        textureData.name = ObjectDataParser._getString(textureObject, ObjectDataParser.NAME, null);
                        textureData.rotated = ObjectDataParser._getBoolean(textureObject, ObjectDataParser.ROTATED, false);
                        textureData.region.x = ObjectDataParser._getNumber(textureObject, ObjectDataParser.X, 0) * scale;
                        textureData.region.y = ObjectDataParser._getNumber(textureObject, ObjectDataParser.Y, 0) * scale;
                        textureData.region.width = ObjectDataParser._getNumber(textureObject, ObjectDataParser.WIDTH, 0) * scale;
                        textureData.region.height = ObjectDataParser._getNumber(textureObject, ObjectDataParser.HEIGHT, 0) * scale;
                        var frameWidth = ObjectDataParser._getNumber(textureObject, ObjectDataParser.FRAME_WIDTH, -1);
                        var frameHeight = ObjectDataParser._getNumber(textureObject, ObjectDataParser.FRAME_HEIGHT, -1);
                        if (frameWidth > 0 && frameHeight > 0) {
                            textureData.frame = dragonBones.TextureData.generateRectangle();
                            textureData.frame.x = ObjectDataParser._getNumber(textureObject, ObjectDataParser.FRAME_X, 0) * scale;
                            textureData.frame.y = ObjectDataParser._getNumber(textureObject, ObjectDataParser.FRAME_Y, 0) * scale;
                            textureData.frame.width = frameWidth * scale;
                            textureData.frame.height = frameHeight * scale;
                        }
                        textureAtlasData.addTextureData(textureData);
                    }
                }
                return textureAtlasData;
            }
            else {
                throw new Error();
            }
            // return null;
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#parseDragonBonesData()
         */
        ObjectDataParser.getInstance = function () {
            if (!ObjectDataParser._instance) {
                ObjectDataParser._instance = new ObjectDataParser();
            }
            return ObjectDataParser._instance;
        };
        /**
         * @deprecated
         */
        ObjectDataParser._instance = null;
        return ObjectDataParser;
    }(dragonBones.DataParser));
    dragonBones.ObjectDataParser = ObjectDataParser;
    egret.registerClass(ObjectDataParser,'dragonBones.ObjectDataParser');
})(dragonBones || (dragonBones = {}));
