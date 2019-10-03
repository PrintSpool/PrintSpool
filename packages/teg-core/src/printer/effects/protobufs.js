/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.teg_protobufs = (function() {

    /**
     * Namespace teg_protobufs.
     * @exports teg_protobufs
     * @namespace
     */
    var teg_protobufs = {};

    teg_protobufs.MachineMessage = (function() {

        /**
         * Properties of a MachineMessage.
         * @memberof teg_protobufs
         * @interface IMachineMessage
         * @property {teg_protobufs.MachineMessage.IFeedback|null} [feedback] MachineMessage feedback
         */

        /**
         * Constructs a new MachineMessage.
         * @memberof teg_protobufs
         * @classdesc Represents a MachineMessage.
         * @implements IMachineMessage
         * @constructor
         * @param {teg_protobufs.IMachineMessage=} [properties] Properties to set
         */
        function MachineMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MachineMessage feedback.
         * @member {teg_protobufs.MachineMessage.IFeedback|null|undefined} feedback
         * @memberof teg_protobufs.MachineMessage
         * @instance
         */
        MachineMessage.prototype.feedback = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * MachineMessage payload.
         * @member {"feedback"|undefined} payload
         * @memberof teg_protobufs.MachineMessage
         * @instance
         */
        Object.defineProperty(MachineMessage.prototype, "payload", {
            get: $util.oneOfGetter($oneOfFields = ["feedback"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new MachineMessage instance using the specified properties.
         * @function create
         * @memberof teg_protobufs.MachineMessage
         * @static
         * @param {teg_protobufs.IMachineMessage=} [properties] Properties to set
         * @returns {teg_protobufs.MachineMessage} MachineMessage instance
         */
        MachineMessage.create = function create(properties) {
            return new MachineMessage(properties);
        };

        /**
         * Encodes the specified MachineMessage message. Does not implicitly {@link teg_protobufs.MachineMessage.verify|verify} messages.
         * @function encode
         * @memberof teg_protobufs.MachineMessage
         * @static
         * @param {teg_protobufs.IMachineMessage} message MachineMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MachineMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.feedback != null && message.hasOwnProperty("feedback"))
                $root.teg_protobufs.MachineMessage.Feedback.encode(message.feedback, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified MachineMessage message, length delimited. Does not implicitly {@link teg_protobufs.MachineMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof teg_protobufs.MachineMessage
         * @static
         * @param {teg_protobufs.IMachineMessage} message MachineMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MachineMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MachineMessage message from the specified reader or buffer.
         * @function decode
         * @memberof teg_protobufs.MachineMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {teg_protobufs.MachineMessage} MachineMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MachineMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.MachineMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 9:
                    message.feedback = $root.teg_protobufs.MachineMessage.Feedback.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MachineMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof teg_protobufs.MachineMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {teg_protobufs.MachineMessage} MachineMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MachineMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MachineMessage message.
         * @function verify
         * @memberof teg_protobufs.MachineMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MachineMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.feedback != null && message.hasOwnProperty("feedback")) {
                properties.payload = 1;
                {
                    var error = $root.teg_protobufs.MachineMessage.Feedback.verify(message.feedback);
                    if (error)
                        return "feedback." + error;
                }
            }
            return null;
        };

        /**
         * Creates a MachineMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof teg_protobufs.MachineMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {teg_protobufs.MachineMessage} MachineMessage
         */
        MachineMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.teg_protobufs.MachineMessage)
                return object;
            var message = new $root.teg_protobufs.MachineMessage();
            if (object.feedback != null) {
                if (typeof object.feedback !== "object")
                    throw TypeError(".teg_protobufs.MachineMessage.feedback: object expected");
                message.feedback = $root.teg_protobufs.MachineMessage.Feedback.fromObject(object.feedback);
            }
            return message;
        };

        /**
         * Creates a plain object from a MachineMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof teg_protobufs.MachineMessage
         * @static
         * @param {teg_protobufs.MachineMessage} message MachineMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MachineMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (message.feedback != null && message.hasOwnProperty("feedback")) {
                object.feedback = $root.teg_protobufs.MachineMessage.Feedback.toObject(message.feedback, options);
                if (options.oneofs)
                    object.payload = "feedback";
            }
            return object;
        };

        /**
         * Converts this MachineMessage to JSON.
         * @function toJSON
         * @memberof teg_protobufs.MachineMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MachineMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        MachineMessage.Feedback = (function() {

            /**
             * Properties of a Feedback.
             * @memberof teg_protobufs.MachineMessage
             * @interface IFeedback
             * @property {number|null} [despooledLineNumber] Feedback despooledLineNumber
             * @property {teg_protobufs.MachineMessage.Status|null} [status] Feedback status
             * @property {Array.<teg_protobufs.MachineMessage.IEvent>|null} [events] Feedback events
             * @property {Array.<teg_protobufs.MachineMessage.IAxis>|null} [axes] Feedback axes
             * @property {Array.<teg_protobufs.MachineMessage.IHeater>|null} [heaters] Feedback heaters
             * @property {Array.<teg_protobufs.MachineMessage.ISpeedController>|null} [speedControllers] Feedback speedControllers
             * @property {Array.<teg_protobufs.MachineMessage.ICommandResponse>|null} [responses] Feedback responses
             * @property {teg_protobufs.MachineMessage.IError|null} [error] Feedback error
             * @property {boolean|null} [motorsEnabled] Feedback motorsEnabled
             */

            /**
             * Constructs a new Feedback.
             * @memberof teg_protobufs.MachineMessage
             * @classdesc Represents a Feedback.
             * @implements IFeedback
             * @constructor
             * @param {teg_protobufs.MachineMessage.IFeedback=} [properties] Properties to set
             */
            function Feedback(properties) {
                this.events = [];
                this.axes = [];
                this.heaters = [];
                this.speedControllers = [];
                this.responses = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Feedback despooledLineNumber.
             * @member {number} despooledLineNumber
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @instance
             */
            Feedback.prototype.despooledLineNumber = 0;

            /**
             * Feedback status.
             * @member {teg_protobufs.MachineMessage.Status} status
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @instance
             */
            Feedback.prototype.status = 0;

            /**
             * Feedback events.
             * @member {Array.<teg_protobufs.MachineMessage.IEvent>} events
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @instance
             */
            Feedback.prototype.events = $util.emptyArray;

            /**
             * Feedback axes.
             * @member {Array.<teg_protobufs.MachineMessage.IAxis>} axes
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @instance
             */
            Feedback.prototype.axes = $util.emptyArray;

            /**
             * Feedback heaters.
             * @member {Array.<teg_protobufs.MachineMessage.IHeater>} heaters
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @instance
             */
            Feedback.prototype.heaters = $util.emptyArray;

            /**
             * Feedback speedControllers.
             * @member {Array.<teg_protobufs.MachineMessage.ISpeedController>} speedControllers
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @instance
             */
            Feedback.prototype.speedControllers = $util.emptyArray;

            /**
             * Feedback responses.
             * @member {Array.<teg_protobufs.MachineMessage.ICommandResponse>} responses
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @instance
             */
            Feedback.prototype.responses = $util.emptyArray;

            /**
             * Feedback error.
             * @member {teg_protobufs.MachineMessage.IError|null|undefined} error
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @instance
             */
            Feedback.prototype.error = null;

            /**
             * Feedback motorsEnabled.
             * @member {boolean} motorsEnabled
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @instance
             */
            Feedback.prototype.motorsEnabled = false;

            /**
             * Creates a new Feedback instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @static
             * @param {teg_protobufs.MachineMessage.IFeedback=} [properties] Properties to set
             * @returns {teg_protobufs.MachineMessage.Feedback} Feedback instance
             */
            Feedback.create = function create(properties) {
                return new Feedback(properties);
            };

            /**
             * Encodes the specified Feedback message. Does not implicitly {@link teg_protobufs.MachineMessage.Feedback.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @static
             * @param {teg_protobufs.MachineMessage.IFeedback} message Feedback message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Feedback.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.despooledLineNumber != null && message.hasOwnProperty("despooledLineNumber"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.despooledLineNumber);
                if (message.status != null && message.hasOwnProperty("status"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.status);
                if (message.events != null && message.events.length)
                    for (var i = 0; i < message.events.length; ++i)
                        $root.teg_protobufs.MachineMessage.Event.encode(message.events[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.axes != null && message.axes.length)
                    for (var i = 0; i < message.axes.length; ++i)
                        $root.teg_protobufs.MachineMessage.Axis.encode(message.axes[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.heaters != null && message.heaters.length)
                    for (var i = 0; i < message.heaters.length; ++i)
                        $root.teg_protobufs.MachineMessage.Heater.encode(message.heaters[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
                if (message.speedControllers != null && message.speedControllers.length)
                    for (var i = 0; i < message.speedControllers.length; ++i)
                        $root.teg_protobufs.MachineMessage.SpeedController.encode(message.speedControllers[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.responses != null && message.responses.length)
                    for (var i = 0; i < message.responses.length; ++i)
                        $root.teg_protobufs.MachineMessage.CommandResponse.encode(message.responses[i], writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                if (message.error != null && message.hasOwnProperty("error"))
                    $root.teg_protobufs.MachineMessage.Error.encode(message.error, writer.uint32(/* id 100, wireType 2 =*/802).fork()).ldelim();
                if (message.motorsEnabled != null && message.hasOwnProperty("motorsEnabled"))
                    writer.uint32(/* id 1000, wireType 0 =*/8000).bool(message.motorsEnabled);
                return writer;
            };

            /**
             * Encodes the specified Feedback message, length delimited. Does not implicitly {@link teg_protobufs.MachineMessage.Feedback.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @static
             * @param {teg_protobufs.MachineMessage.IFeedback} message Feedback message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Feedback.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Feedback message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.MachineMessage.Feedback} Feedback
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Feedback.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.MachineMessage.Feedback();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.despooledLineNumber = reader.uint32();
                        break;
                    case 2:
                        message.status = reader.int32();
                        break;
                    case 3:
                        if (!(message.events && message.events.length))
                            message.events = [];
                        message.events.push($root.teg_protobufs.MachineMessage.Event.decode(reader, reader.uint32()));
                        break;
                    case 4:
                        if (!(message.axes && message.axes.length))
                            message.axes = [];
                        message.axes.push($root.teg_protobufs.MachineMessage.Axis.decode(reader, reader.uint32()));
                        break;
                    case 5:
                        if (!(message.heaters && message.heaters.length))
                            message.heaters = [];
                        message.heaters.push($root.teg_protobufs.MachineMessage.Heater.decode(reader, reader.uint32()));
                        break;
                    case 6:
                        if (!(message.speedControllers && message.speedControllers.length))
                            message.speedControllers = [];
                        message.speedControllers.push($root.teg_protobufs.MachineMessage.SpeedController.decode(reader, reader.uint32()));
                        break;
                    case 7:
                        if (!(message.responses && message.responses.length))
                            message.responses = [];
                        message.responses.push($root.teg_protobufs.MachineMessage.CommandResponse.decode(reader, reader.uint32()));
                        break;
                    case 100:
                        message.error = $root.teg_protobufs.MachineMessage.Error.decode(reader, reader.uint32());
                        break;
                    case 1000:
                        message.motorsEnabled = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Feedback message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.MachineMessage.Feedback} Feedback
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Feedback.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Feedback message.
             * @function verify
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Feedback.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.despooledLineNumber != null && message.hasOwnProperty("despooledLineNumber"))
                    if (!$util.isInteger(message.despooledLineNumber))
                        return "despooledLineNumber: integer expected";
                if (message.status != null && message.hasOwnProperty("status"))
                    switch (message.status) {
                    default:
                        return "status: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        break;
                    }
                if (message.events != null && message.hasOwnProperty("events")) {
                    if (!Array.isArray(message.events))
                        return "events: array expected";
                    for (var i = 0; i < message.events.length; ++i) {
                        var error = $root.teg_protobufs.MachineMessage.Event.verify(message.events[i]);
                        if (error)
                            return "events." + error;
                    }
                }
                if (message.axes != null && message.hasOwnProperty("axes")) {
                    if (!Array.isArray(message.axes))
                        return "axes: array expected";
                    for (var i = 0; i < message.axes.length; ++i) {
                        var error = $root.teg_protobufs.MachineMessage.Axis.verify(message.axes[i]);
                        if (error)
                            return "axes." + error;
                    }
                }
                if (message.heaters != null && message.hasOwnProperty("heaters")) {
                    if (!Array.isArray(message.heaters))
                        return "heaters: array expected";
                    for (var i = 0; i < message.heaters.length; ++i) {
                        var error = $root.teg_protobufs.MachineMessage.Heater.verify(message.heaters[i]);
                        if (error)
                            return "heaters." + error;
                    }
                }
                if (message.speedControllers != null && message.hasOwnProperty("speedControllers")) {
                    if (!Array.isArray(message.speedControllers))
                        return "speedControllers: array expected";
                    for (var i = 0; i < message.speedControllers.length; ++i) {
                        var error = $root.teg_protobufs.MachineMessage.SpeedController.verify(message.speedControllers[i]);
                        if (error)
                            return "speedControllers." + error;
                    }
                }
                if (message.responses != null && message.hasOwnProperty("responses")) {
                    if (!Array.isArray(message.responses))
                        return "responses: array expected";
                    for (var i = 0; i < message.responses.length; ++i) {
                        var error = $root.teg_protobufs.MachineMessage.CommandResponse.verify(message.responses[i]);
                        if (error)
                            return "responses." + error;
                    }
                }
                if (message.error != null && message.hasOwnProperty("error")) {
                    var error = $root.teg_protobufs.MachineMessage.Error.verify(message.error);
                    if (error)
                        return "error." + error;
                }
                if (message.motorsEnabled != null && message.hasOwnProperty("motorsEnabled"))
                    if (typeof message.motorsEnabled !== "boolean")
                        return "motorsEnabled: boolean expected";
                return null;
            };

            /**
             * Creates a Feedback message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.MachineMessage.Feedback} Feedback
             */
            Feedback.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.MachineMessage.Feedback)
                    return object;
                var message = new $root.teg_protobufs.MachineMessage.Feedback();
                if (object.despooledLineNumber != null)
                    message.despooledLineNumber = object.despooledLineNumber >>> 0;
                switch (object.status) {
                case "ERRORED":
                case 0:
                    message.status = 0;
                    break;
                case "ESTOPPED":
                case 1:
                    message.status = 1;
                    break;
                case "DISCONNECTED":
                case 2:
                    message.status = 2;
                    break;
                case "CONNECTING":
                case 3:
                    message.status = 3;
                    break;
                case "READY":
                case 4:
                    message.status = 4;
                    break;
                }
                if (object.events) {
                    if (!Array.isArray(object.events))
                        throw TypeError(".teg_protobufs.MachineMessage.Feedback.events: array expected");
                    message.events = [];
                    for (var i = 0; i < object.events.length; ++i) {
                        if (typeof object.events[i] !== "object")
                            throw TypeError(".teg_protobufs.MachineMessage.Feedback.events: object expected");
                        message.events[i] = $root.teg_protobufs.MachineMessage.Event.fromObject(object.events[i]);
                    }
                }
                if (object.axes) {
                    if (!Array.isArray(object.axes))
                        throw TypeError(".teg_protobufs.MachineMessage.Feedback.axes: array expected");
                    message.axes = [];
                    for (var i = 0; i < object.axes.length; ++i) {
                        if (typeof object.axes[i] !== "object")
                            throw TypeError(".teg_protobufs.MachineMessage.Feedback.axes: object expected");
                        message.axes[i] = $root.teg_protobufs.MachineMessage.Axis.fromObject(object.axes[i]);
                    }
                }
                if (object.heaters) {
                    if (!Array.isArray(object.heaters))
                        throw TypeError(".teg_protobufs.MachineMessage.Feedback.heaters: array expected");
                    message.heaters = [];
                    for (var i = 0; i < object.heaters.length; ++i) {
                        if (typeof object.heaters[i] !== "object")
                            throw TypeError(".teg_protobufs.MachineMessage.Feedback.heaters: object expected");
                        message.heaters[i] = $root.teg_protobufs.MachineMessage.Heater.fromObject(object.heaters[i]);
                    }
                }
                if (object.speedControllers) {
                    if (!Array.isArray(object.speedControllers))
                        throw TypeError(".teg_protobufs.MachineMessage.Feedback.speedControllers: array expected");
                    message.speedControllers = [];
                    for (var i = 0; i < object.speedControllers.length; ++i) {
                        if (typeof object.speedControllers[i] !== "object")
                            throw TypeError(".teg_protobufs.MachineMessage.Feedback.speedControllers: object expected");
                        message.speedControllers[i] = $root.teg_protobufs.MachineMessage.SpeedController.fromObject(object.speedControllers[i]);
                    }
                }
                if (object.responses) {
                    if (!Array.isArray(object.responses))
                        throw TypeError(".teg_protobufs.MachineMessage.Feedback.responses: array expected");
                    message.responses = [];
                    for (var i = 0; i < object.responses.length; ++i) {
                        if (typeof object.responses[i] !== "object")
                            throw TypeError(".teg_protobufs.MachineMessage.Feedback.responses: object expected");
                        message.responses[i] = $root.teg_protobufs.MachineMessage.CommandResponse.fromObject(object.responses[i]);
                    }
                }
                if (object.error != null) {
                    if (typeof object.error !== "object")
                        throw TypeError(".teg_protobufs.MachineMessage.Feedback.error: object expected");
                    message.error = $root.teg_protobufs.MachineMessage.Error.fromObject(object.error);
                }
                if (object.motorsEnabled != null)
                    message.motorsEnabled = Boolean(object.motorsEnabled);
                return message;
            };

            /**
             * Creates a plain object from a Feedback message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @static
             * @param {teg_protobufs.MachineMessage.Feedback} message Feedback
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Feedback.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.events = [];
                    object.axes = [];
                    object.heaters = [];
                    object.speedControllers = [];
                    object.responses = [];
                }
                if (options.defaults) {
                    object.despooledLineNumber = 0;
                    object.status = options.enums === String ? "ERRORED" : 0;
                    object.error = null;
                    object.motorsEnabled = false;
                }
                if (message.despooledLineNumber != null && message.hasOwnProperty("despooledLineNumber"))
                    object.despooledLineNumber = message.despooledLineNumber;
                if (message.status != null && message.hasOwnProperty("status"))
                    object.status = options.enums === String ? $root.teg_protobufs.MachineMessage.Status[message.status] : message.status;
                if (message.events && message.events.length) {
                    object.events = [];
                    for (var j = 0; j < message.events.length; ++j)
                        object.events[j] = $root.teg_protobufs.MachineMessage.Event.toObject(message.events[j], options);
                }
                if (message.axes && message.axes.length) {
                    object.axes = [];
                    for (var j = 0; j < message.axes.length; ++j)
                        object.axes[j] = $root.teg_protobufs.MachineMessage.Axis.toObject(message.axes[j], options);
                }
                if (message.heaters && message.heaters.length) {
                    object.heaters = [];
                    for (var j = 0; j < message.heaters.length; ++j)
                        object.heaters[j] = $root.teg_protobufs.MachineMessage.Heater.toObject(message.heaters[j], options);
                }
                if (message.speedControllers && message.speedControllers.length) {
                    object.speedControllers = [];
                    for (var j = 0; j < message.speedControllers.length; ++j)
                        object.speedControllers[j] = $root.teg_protobufs.MachineMessage.SpeedController.toObject(message.speedControllers[j], options);
                }
                if (message.responses && message.responses.length) {
                    object.responses = [];
                    for (var j = 0; j < message.responses.length; ++j)
                        object.responses[j] = $root.teg_protobufs.MachineMessage.CommandResponse.toObject(message.responses[j], options);
                }
                if (message.error != null && message.hasOwnProperty("error"))
                    object.error = $root.teg_protobufs.MachineMessage.Error.toObject(message.error, options);
                if (message.motorsEnabled != null && message.hasOwnProperty("motorsEnabled"))
                    object.motorsEnabled = message.motorsEnabled;
                return object;
            };

            /**
             * Converts this Feedback to JSON.
             * @function toJSON
             * @memberof teg_protobufs.MachineMessage.Feedback
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Feedback.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Feedback;
        })();

        /**
         * Status enum.
         * @name teg_protobufs.MachineMessage.Status
         * @enum {string}
         * @property {number} ERRORED=0 ERRORED value
         * @property {number} ESTOPPED=1 ESTOPPED value
         * @property {number} DISCONNECTED=2 DISCONNECTED value
         * @property {number} CONNECTING=3 CONNECTING value
         * @property {number} READY=4 READY value
         */
        MachineMessage.Status = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "ERRORED"] = 0;
            values[valuesById[1] = "ESTOPPED"] = 1;
            values[valuesById[2] = "DISCONNECTED"] = 2;
            values[valuesById[3] = "CONNECTING"] = 3;
            values[valuesById[4] = "READY"] = 4;
            return values;
        })();

        MachineMessage.Error = (function() {

            /**
             * Properties of an Error.
             * @memberof teg_protobufs.MachineMessage
             * @interface IError
             * @property {string|null} [message] Error message
             */

            /**
             * Constructs a new Error.
             * @memberof teg_protobufs.MachineMessage
             * @classdesc Represents an Error.
             * @implements IError
             * @constructor
             * @param {teg_protobufs.MachineMessage.IError=} [properties] Properties to set
             */
            function Error(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Error message.
             * @member {string} message
             * @memberof teg_protobufs.MachineMessage.Error
             * @instance
             */
            Error.prototype.message = "";

            /**
             * Creates a new Error instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.MachineMessage.Error
             * @static
             * @param {teg_protobufs.MachineMessage.IError=} [properties] Properties to set
             * @returns {teg_protobufs.MachineMessage.Error} Error instance
             */
            Error.create = function create(properties) {
                return new Error(properties);
            };

            /**
             * Encodes the specified Error message. Does not implicitly {@link teg_protobufs.MachineMessage.Error.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.MachineMessage.Error
             * @static
             * @param {teg_protobufs.MachineMessage.IError} message Error message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Error.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.message != null && message.hasOwnProperty("message"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.message);
                return writer;
            };

            /**
             * Encodes the specified Error message, length delimited. Does not implicitly {@link teg_protobufs.MachineMessage.Error.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.MachineMessage.Error
             * @static
             * @param {teg_protobufs.MachineMessage.IError} message Error message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Error.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Error message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.MachineMessage.Error
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.MachineMessage.Error} Error
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Error.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.MachineMessage.Error();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.message = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Error message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.MachineMessage.Error
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.MachineMessage.Error} Error
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Error.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Error message.
             * @function verify
             * @memberof teg_protobufs.MachineMessage.Error
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Error.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.message != null && message.hasOwnProperty("message"))
                    if (!$util.isString(message.message))
                        return "message: string expected";
                return null;
            };

            /**
             * Creates an Error message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.MachineMessage.Error
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.MachineMessage.Error} Error
             */
            Error.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.MachineMessage.Error)
                    return object;
                var message = new $root.teg_protobufs.MachineMessage.Error();
                if (object.message != null)
                    message.message = String(object.message);
                return message;
            };

            /**
             * Creates a plain object from an Error message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.MachineMessage.Error
             * @static
             * @param {teg_protobufs.MachineMessage.Error} message Error
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Error.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.message = "";
                if (message.message != null && message.hasOwnProperty("message"))
                    object.message = message.message;
                return object;
            };

            /**
             * Converts this Error to JSON.
             * @function toJSON
             * @memberof teg_protobufs.MachineMessage.Error
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Error.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Error;
        })();

        /**
         * EventType enum.
         * @name teg_protobufs.MachineMessage.EventType
         * @enum {string}
         * @property {number} CANCEL_TASK=0 CANCEL_TASK value
         * @property {number} PAUSE_TASK=1 PAUSE_TASK value
         * @property {number} ERROR=2 ERROR value
         * @property {number} START_TASK=3 START_TASK value
         * @property {number} FINISH_TASK=4 FINISH_TASK value
         */
        MachineMessage.EventType = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "CANCEL_TASK"] = 0;
            values[valuesById[1] = "PAUSE_TASK"] = 1;
            values[valuesById[2] = "ERROR"] = 2;
            values[valuesById[3] = "START_TASK"] = 3;
            values[valuesById[4] = "FINISH_TASK"] = 4;
            return values;
        })();

        MachineMessage.Event = (function() {

            /**
             * Properties of an Event.
             * @memberof teg_protobufs.MachineMessage
             * @interface IEvent
             * @property {number|null} [taskId] Event taskId
             * @property {teg_protobufs.MachineMessage.EventType|null} [type] Event type
             * @property {number|Long|null} [createdAt] Event createdAt
             * @property {teg_protobufs.MachineMessage.IError|null} [error] Event error
             */

            /**
             * Constructs a new Event.
             * @memberof teg_protobufs.MachineMessage
             * @classdesc Represents an Event.
             * @implements IEvent
             * @constructor
             * @param {teg_protobufs.MachineMessage.IEvent=} [properties] Properties to set
             */
            function Event(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Event taskId.
             * @member {number} taskId
             * @memberof teg_protobufs.MachineMessage.Event
             * @instance
             */
            Event.prototype.taskId = 0;

            /**
             * Event type.
             * @member {teg_protobufs.MachineMessage.EventType} type
             * @memberof teg_protobufs.MachineMessage.Event
             * @instance
             */
            Event.prototype.type = 0;

            /**
             * Event createdAt.
             * @member {number|Long} createdAt
             * @memberof teg_protobufs.MachineMessage.Event
             * @instance
             */
            Event.prototype.createdAt = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Event error.
             * @member {teg_protobufs.MachineMessage.IError|null|undefined} error
             * @memberof teg_protobufs.MachineMessage.Event
             * @instance
             */
            Event.prototype.error = null;

            /**
             * Creates a new Event instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.MachineMessage.Event
             * @static
             * @param {teg_protobufs.MachineMessage.IEvent=} [properties] Properties to set
             * @returns {teg_protobufs.MachineMessage.Event} Event instance
             */
            Event.create = function create(properties) {
                return new Event(properties);
            };

            /**
             * Encodes the specified Event message. Does not implicitly {@link teg_protobufs.MachineMessage.Event.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.MachineMessage.Event
             * @static
             * @param {teg_protobufs.MachineMessage.IEvent} message Event message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Event.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.taskId);
                if (message.type != null && message.hasOwnProperty("type"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int64(message.createdAt);
                if (message.error != null && message.hasOwnProperty("error"))
                    $root.teg_protobufs.MachineMessage.Error.encode(message.error, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Event message, length delimited. Does not implicitly {@link teg_protobufs.MachineMessage.Event.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.MachineMessage.Event
             * @static
             * @param {teg_protobufs.MachineMessage.IEvent} message Event message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Event.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Event message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.MachineMessage.Event
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.MachineMessage.Event} Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Event.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.MachineMessage.Event();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.taskId = reader.uint32();
                        break;
                    case 2:
                        message.type = reader.int32();
                        break;
                    case 3:
                        message.createdAt = reader.int64();
                        break;
                    case 4:
                        message.error = $root.teg_protobufs.MachineMessage.Error.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Event message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.MachineMessage.Event
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.MachineMessage.Event} Event
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Event.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Event message.
             * @function verify
             * @memberof teg_protobufs.MachineMessage.Event
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Event.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    if (!$util.isInteger(message.taskId))
                        return "taskId: integer expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                        break;
                    }
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    if (!$util.isInteger(message.createdAt) && !(message.createdAt && $util.isInteger(message.createdAt.low) && $util.isInteger(message.createdAt.high)))
                        return "createdAt: integer|Long expected";
                if (message.error != null && message.hasOwnProperty("error")) {
                    var error = $root.teg_protobufs.MachineMessage.Error.verify(message.error);
                    if (error)
                        return "error." + error;
                }
                return null;
            };

            /**
             * Creates an Event message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.MachineMessage.Event
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.MachineMessage.Event} Event
             */
            Event.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.MachineMessage.Event)
                    return object;
                var message = new $root.teg_protobufs.MachineMessage.Event();
                if (object.taskId != null)
                    message.taskId = object.taskId >>> 0;
                switch (object.type) {
                case "CANCEL_TASK":
                case 0:
                    message.type = 0;
                    break;
                case "PAUSE_TASK":
                case 1:
                    message.type = 1;
                    break;
                case "ERROR":
                case 2:
                    message.type = 2;
                    break;
                case "START_TASK":
                case 3:
                    message.type = 3;
                    break;
                case "FINISH_TASK":
                case 4:
                    message.type = 4;
                    break;
                }
                if (object.createdAt != null)
                    if ($util.Long)
                        (message.createdAt = $util.Long.fromValue(object.createdAt)).unsigned = false;
                    else if (typeof object.createdAt === "string")
                        message.createdAt = parseInt(object.createdAt, 10);
                    else if (typeof object.createdAt === "number")
                        message.createdAt = object.createdAt;
                    else if (typeof object.createdAt === "object")
                        message.createdAt = new $util.LongBits(object.createdAt.low >>> 0, object.createdAt.high >>> 0).toNumber();
                if (object.error != null) {
                    if (typeof object.error !== "object")
                        throw TypeError(".teg_protobufs.MachineMessage.Event.error: object expected");
                    message.error = $root.teg_protobufs.MachineMessage.Error.fromObject(object.error);
                }
                return message;
            };

            /**
             * Creates a plain object from an Event message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.MachineMessage.Event
             * @static
             * @param {teg_protobufs.MachineMessage.Event} message Event
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Event.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.taskId = 0;
                    object.type = options.enums === String ? "CANCEL_TASK" : 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.createdAt = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.createdAt = options.longs === String ? "0" : 0;
                    object.error = null;
                }
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    object.taskId = message.taskId;
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.teg_protobufs.MachineMessage.EventType[message.type] : message.type;
                if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                    if (typeof message.createdAt === "number")
                        object.createdAt = options.longs === String ? String(message.createdAt) : message.createdAt;
                    else
                        object.createdAt = options.longs === String ? $util.Long.prototype.toString.call(message.createdAt) : options.longs === Number ? new $util.LongBits(message.createdAt.low >>> 0, message.createdAt.high >>> 0).toNumber() : message.createdAt;
                if (message.error != null && message.hasOwnProperty("error"))
                    object.error = $root.teg_protobufs.MachineMessage.Error.toObject(message.error, options);
                return object;
            };

            /**
             * Converts this Event to JSON.
             * @function toJSON
             * @memberof teg_protobufs.MachineMessage.Event
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Event.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Event;
        })();

        MachineMessage.Axis = (function() {

            /**
             * Properties of an Axis.
             * @memberof teg_protobufs.MachineMessage
             * @interface IAxis
             * @property {string|null} [address] Axis address
             * @property {number|null} [targetPosition] Axis targetPosition
             * @property {number|null} [actualPosition] Axis actualPosition
             * @property {boolean|null} [homed] Axis homed
             */

            /**
             * Constructs a new Axis.
             * @memberof teg_protobufs.MachineMessage
             * @classdesc Represents an Axis.
             * @implements IAxis
             * @constructor
             * @param {teg_protobufs.MachineMessage.IAxis=} [properties] Properties to set
             */
            function Axis(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Axis address.
             * @member {string} address
             * @memberof teg_protobufs.MachineMessage.Axis
             * @instance
             */
            Axis.prototype.address = "";

            /**
             * Axis targetPosition.
             * @member {number} targetPosition
             * @memberof teg_protobufs.MachineMessage.Axis
             * @instance
             */
            Axis.prototype.targetPosition = 0;

            /**
             * Axis actualPosition.
             * @member {number} actualPosition
             * @memberof teg_protobufs.MachineMessage.Axis
             * @instance
             */
            Axis.prototype.actualPosition = 0;

            /**
             * Axis homed.
             * @member {boolean} homed
             * @memberof teg_protobufs.MachineMessage.Axis
             * @instance
             */
            Axis.prototype.homed = false;

            /**
             * Creates a new Axis instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.MachineMessage.Axis
             * @static
             * @param {teg_protobufs.MachineMessage.IAxis=} [properties] Properties to set
             * @returns {teg_protobufs.MachineMessage.Axis} Axis instance
             */
            Axis.create = function create(properties) {
                return new Axis(properties);
            };

            /**
             * Encodes the specified Axis message. Does not implicitly {@link teg_protobufs.MachineMessage.Axis.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.MachineMessage.Axis
             * @static
             * @param {teg_protobufs.MachineMessage.IAxis} message Axis message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Axis.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.address != null && message.hasOwnProperty("address"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.address);
                if (message.targetPosition != null && message.hasOwnProperty("targetPosition"))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.targetPosition);
                if (message.actualPosition != null && message.hasOwnProperty("actualPosition"))
                    writer.uint32(/* id 3, wireType 5 =*/29).float(message.actualPosition);
                if (message.homed != null && message.hasOwnProperty("homed"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.homed);
                return writer;
            };

            /**
             * Encodes the specified Axis message, length delimited. Does not implicitly {@link teg_protobufs.MachineMessage.Axis.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.MachineMessage.Axis
             * @static
             * @param {teg_protobufs.MachineMessage.IAxis} message Axis message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Axis.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Axis message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.MachineMessage.Axis
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.MachineMessage.Axis} Axis
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Axis.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.MachineMessage.Axis();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.address = reader.string();
                        break;
                    case 2:
                        message.targetPosition = reader.float();
                        break;
                    case 3:
                        message.actualPosition = reader.float();
                        break;
                    case 4:
                        message.homed = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Axis message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.MachineMessage.Axis
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.MachineMessage.Axis} Axis
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Axis.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Axis message.
             * @function verify
             * @memberof teg_protobufs.MachineMessage.Axis
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Axis.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.address != null && message.hasOwnProperty("address"))
                    if (!$util.isString(message.address))
                        return "address: string expected";
                if (message.targetPosition != null && message.hasOwnProperty("targetPosition"))
                    if (typeof message.targetPosition !== "number")
                        return "targetPosition: number expected";
                if (message.actualPosition != null && message.hasOwnProperty("actualPosition"))
                    if (typeof message.actualPosition !== "number")
                        return "actualPosition: number expected";
                if (message.homed != null && message.hasOwnProperty("homed"))
                    if (typeof message.homed !== "boolean")
                        return "homed: boolean expected";
                return null;
            };

            /**
             * Creates an Axis message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.MachineMessage.Axis
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.MachineMessage.Axis} Axis
             */
            Axis.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.MachineMessage.Axis)
                    return object;
                var message = new $root.teg_protobufs.MachineMessage.Axis();
                if (object.address != null)
                    message.address = String(object.address);
                if (object.targetPosition != null)
                    message.targetPosition = Number(object.targetPosition);
                if (object.actualPosition != null)
                    message.actualPosition = Number(object.actualPosition);
                if (object.homed != null)
                    message.homed = Boolean(object.homed);
                return message;
            };

            /**
             * Creates a plain object from an Axis message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.MachineMessage.Axis
             * @static
             * @param {teg_protobufs.MachineMessage.Axis} message Axis
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Axis.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.address = "";
                    object.targetPosition = 0;
                    object.actualPosition = 0;
                    object.homed = false;
                }
                if (message.address != null && message.hasOwnProperty("address"))
                    object.address = message.address;
                if (message.targetPosition != null && message.hasOwnProperty("targetPosition"))
                    object.targetPosition = options.json && !isFinite(message.targetPosition) ? String(message.targetPosition) : message.targetPosition;
                if (message.actualPosition != null && message.hasOwnProperty("actualPosition"))
                    object.actualPosition = options.json && !isFinite(message.actualPosition) ? String(message.actualPosition) : message.actualPosition;
                if (message.homed != null && message.hasOwnProperty("homed"))
                    object.homed = message.homed;
                return object;
            };

            /**
             * Converts this Axis to JSON.
             * @function toJSON
             * @memberof teg_protobufs.MachineMessage.Axis
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Axis.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Axis;
        })();

        MachineMessage.Heater = (function() {

            /**
             * Properties of a Heater.
             * @memberof teg_protobufs.MachineMessage
             * @interface IHeater
             * @property {string|null} [address] Heater address
             * @property {number|null} [targetTemperature] Heater targetTemperature
             * @property {number|null} [actualTemperature] Heater actualTemperature
             * @property {boolean|null} [enabled] Heater enabled
             * @property {boolean|null} [blocking] Heater blocking
             */

            /**
             * Constructs a new Heater.
             * @memberof teg_protobufs.MachineMessage
             * @classdesc Represents a Heater.
             * @implements IHeater
             * @constructor
             * @param {teg_protobufs.MachineMessage.IHeater=} [properties] Properties to set
             */
            function Heater(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Heater address.
             * @member {string} address
             * @memberof teg_protobufs.MachineMessage.Heater
             * @instance
             */
            Heater.prototype.address = "";

            /**
             * Heater targetTemperature.
             * @member {number} targetTemperature
             * @memberof teg_protobufs.MachineMessage.Heater
             * @instance
             */
            Heater.prototype.targetTemperature = 0;

            /**
             * Heater actualTemperature.
             * @member {number} actualTemperature
             * @memberof teg_protobufs.MachineMessage.Heater
             * @instance
             */
            Heater.prototype.actualTemperature = 0;

            /**
             * Heater enabled.
             * @member {boolean} enabled
             * @memberof teg_protobufs.MachineMessage.Heater
             * @instance
             */
            Heater.prototype.enabled = false;

            /**
             * Heater blocking.
             * @member {boolean} blocking
             * @memberof teg_protobufs.MachineMessage.Heater
             * @instance
             */
            Heater.prototype.blocking = false;

            /**
             * Creates a new Heater instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.MachineMessage.Heater
             * @static
             * @param {teg_protobufs.MachineMessage.IHeater=} [properties] Properties to set
             * @returns {teg_protobufs.MachineMessage.Heater} Heater instance
             */
            Heater.create = function create(properties) {
                return new Heater(properties);
            };

            /**
             * Encodes the specified Heater message. Does not implicitly {@link teg_protobufs.MachineMessage.Heater.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.MachineMessage.Heater
             * @static
             * @param {teg_protobufs.MachineMessage.IHeater} message Heater message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Heater.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.address != null && message.hasOwnProperty("address"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.address);
                if (message.targetTemperature != null && message.hasOwnProperty("targetTemperature"))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.targetTemperature);
                if (message.actualTemperature != null && message.hasOwnProperty("actualTemperature"))
                    writer.uint32(/* id 3, wireType 5 =*/29).float(message.actualTemperature);
                if (message.enabled != null && message.hasOwnProperty("enabled"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.enabled);
                if (message.blocking != null && message.hasOwnProperty("blocking"))
                    writer.uint32(/* id 5, wireType 0 =*/40).bool(message.blocking);
                return writer;
            };

            /**
             * Encodes the specified Heater message, length delimited. Does not implicitly {@link teg_protobufs.MachineMessage.Heater.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.MachineMessage.Heater
             * @static
             * @param {teg_protobufs.MachineMessage.IHeater} message Heater message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Heater.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Heater message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.MachineMessage.Heater
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.MachineMessage.Heater} Heater
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Heater.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.MachineMessage.Heater();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.address = reader.string();
                        break;
                    case 2:
                        message.targetTemperature = reader.float();
                        break;
                    case 3:
                        message.actualTemperature = reader.float();
                        break;
                    case 4:
                        message.enabled = reader.bool();
                        break;
                    case 5:
                        message.blocking = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Heater message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.MachineMessage.Heater
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.MachineMessage.Heater} Heater
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Heater.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Heater message.
             * @function verify
             * @memberof teg_protobufs.MachineMessage.Heater
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Heater.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.address != null && message.hasOwnProperty("address"))
                    if (!$util.isString(message.address))
                        return "address: string expected";
                if (message.targetTemperature != null && message.hasOwnProperty("targetTemperature"))
                    if (typeof message.targetTemperature !== "number")
                        return "targetTemperature: number expected";
                if (message.actualTemperature != null && message.hasOwnProperty("actualTemperature"))
                    if (typeof message.actualTemperature !== "number")
                        return "actualTemperature: number expected";
                if (message.enabled != null && message.hasOwnProperty("enabled"))
                    if (typeof message.enabled !== "boolean")
                        return "enabled: boolean expected";
                if (message.blocking != null && message.hasOwnProperty("blocking"))
                    if (typeof message.blocking !== "boolean")
                        return "blocking: boolean expected";
                return null;
            };

            /**
             * Creates a Heater message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.MachineMessage.Heater
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.MachineMessage.Heater} Heater
             */
            Heater.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.MachineMessage.Heater)
                    return object;
                var message = new $root.teg_protobufs.MachineMessage.Heater();
                if (object.address != null)
                    message.address = String(object.address);
                if (object.targetTemperature != null)
                    message.targetTemperature = Number(object.targetTemperature);
                if (object.actualTemperature != null)
                    message.actualTemperature = Number(object.actualTemperature);
                if (object.enabled != null)
                    message.enabled = Boolean(object.enabled);
                if (object.blocking != null)
                    message.blocking = Boolean(object.blocking);
                return message;
            };

            /**
             * Creates a plain object from a Heater message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.MachineMessage.Heater
             * @static
             * @param {teg_protobufs.MachineMessage.Heater} message Heater
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Heater.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.address = "";
                    object.targetTemperature = 0;
                    object.actualTemperature = 0;
                    object.enabled = false;
                    object.blocking = false;
                }
                if (message.address != null && message.hasOwnProperty("address"))
                    object.address = message.address;
                if (message.targetTemperature != null && message.hasOwnProperty("targetTemperature"))
                    object.targetTemperature = options.json && !isFinite(message.targetTemperature) ? String(message.targetTemperature) : message.targetTemperature;
                if (message.actualTemperature != null && message.hasOwnProperty("actualTemperature"))
                    object.actualTemperature = options.json && !isFinite(message.actualTemperature) ? String(message.actualTemperature) : message.actualTemperature;
                if (message.enabled != null && message.hasOwnProperty("enabled"))
                    object.enabled = message.enabled;
                if (message.blocking != null && message.hasOwnProperty("blocking"))
                    object.blocking = message.blocking;
                return object;
            };

            /**
             * Converts this Heater to JSON.
             * @function toJSON
             * @memberof teg_protobufs.MachineMessage.Heater
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Heater.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Heater;
        })();

        MachineMessage.SpeedController = (function() {

            /**
             * Properties of a SpeedController.
             * @memberof teg_protobufs.MachineMessage
             * @interface ISpeedController
             * @property {string|null} [address] SpeedController address
             * @property {number|null} [targetSpeed] SpeedController targetSpeed
             * @property {number|null} [actualSpeed] SpeedController actualSpeed
             * @property {boolean|null} [enabled] SpeedController enabled
             */

            /**
             * Constructs a new SpeedController.
             * @memberof teg_protobufs.MachineMessage
             * @classdesc Represents a SpeedController.
             * @implements ISpeedController
             * @constructor
             * @param {teg_protobufs.MachineMessage.ISpeedController=} [properties] Properties to set
             */
            function SpeedController(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SpeedController address.
             * @member {string} address
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @instance
             */
            SpeedController.prototype.address = "";

            /**
             * SpeedController targetSpeed.
             * @member {number} targetSpeed
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @instance
             */
            SpeedController.prototype.targetSpeed = 0;

            /**
             * SpeedController actualSpeed.
             * @member {number} actualSpeed
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @instance
             */
            SpeedController.prototype.actualSpeed = 0;

            /**
             * SpeedController enabled.
             * @member {boolean} enabled
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @instance
             */
            SpeedController.prototype.enabled = false;

            /**
             * Creates a new SpeedController instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @static
             * @param {teg_protobufs.MachineMessage.ISpeedController=} [properties] Properties to set
             * @returns {teg_protobufs.MachineMessage.SpeedController} SpeedController instance
             */
            SpeedController.create = function create(properties) {
                return new SpeedController(properties);
            };

            /**
             * Encodes the specified SpeedController message. Does not implicitly {@link teg_protobufs.MachineMessage.SpeedController.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @static
             * @param {teg_protobufs.MachineMessage.ISpeedController} message SpeedController message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SpeedController.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.address != null && message.hasOwnProperty("address"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.address);
                if (message.targetSpeed != null && message.hasOwnProperty("targetSpeed"))
                    writer.uint32(/* id 2, wireType 5 =*/21).float(message.targetSpeed);
                if (message.actualSpeed != null && message.hasOwnProperty("actualSpeed"))
                    writer.uint32(/* id 3, wireType 5 =*/29).float(message.actualSpeed);
                if (message.enabled != null && message.hasOwnProperty("enabled"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.enabled);
                return writer;
            };

            /**
             * Encodes the specified SpeedController message, length delimited. Does not implicitly {@link teg_protobufs.MachineMessage.SpeedController.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @static
             * @param {teg_protobufs.MachineMessage.ISpeedController} message SpeedController message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SpeedController.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SpeedController message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.MachineMessage.SpeedController} SpeedController
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SpeedController.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.MachineMessage.SpeedController();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.address = reader.string();
                        break;
                    case 2:
                        message.targetSpeed = reader.float();
                        break;
                    case 3:
                        message.actualSpeed = reader.float();
                        break;
                    case 4:
                        message.enabled = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a SpeedController message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.MachineMessage.SpeedController} SpeedController
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SpeedController.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SpeedController message.
             * @function verify
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SpeedController.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.address != null && message.hasOwnProperty("address"))
                    if (!$util.isString(message.address))
                        return "address: string expected";
                if (message.targetSpeed != null && message.hasOwnProperty("targetSpeed"))
                    if (typeof message.targetSpeed !== "number")
                        return "targetSpeed: number expected";
                if (message.actualSpeed != null && message.hasOwnProperty("actualSpeed"))
                    if (typeof message.actualSpeed !== "number")
                        return "actualSpeed: number expected";
                if (message.enabled != null && message.hasOwnProperty("enabled"))
                    if (typeof message.enabled !== "boolean")
                        return "enabled: boolean expected";
                return null;
            };

            /**
             * Creates a SpeedController message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.MachineMessage.SpeedController} SpeedController
             */
            SpeedController.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.MachineMessage.SpeedController)
                    return object;
                var message = new $root.teg_protobufs.MachineMessage.SpeedController();
                if (object.address != null)
                    message.address = String(object.address);
                if (object.targetSpeed != null)
                    message.targetSpeed = Number(object.targetSpeed);
                if (object.actualSpeed != null)
                    message.actualSpeed = Number(object.actualSpeed);
                if (object.enabled != null)
                    message.enabled = Boolean(object.enabled);
                return message;
            };

            /**
             * Creates a plain object from a SpeedController message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @static
             * @param {teg_protobufs.MachineMessage.SpeedController} message SpeedController
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SpeedController.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.address = "";
                    object.targetSpeed = 0;
                    object.actualSpeed = 0;
                    object.enabled = false;
                }
                if (message.address != null && message.hasOwnProperty("address"))
                    object.address = message.address;
                if (message.targetSpeed != null && message.hasOwnProperty("targetSpeed"))
                    object.targetSpeed = options.json && !isFinite(message.targetSpeed) ? String(message.targetSpeed) : message.targetSpeed;
                if (message.actualSpeed != null && message.hasOwnProperty("actualSpeed"))
                    object.actualSpeed = options.json && !isFinite(message.actualSpeed) ? String(message.actualSpeed) : message.actualSpeed;
                if (message.enabled != null && message.hasOwnProperty("enabled"))
                    object.enabled = message.enabled;
                return object;
            };

            /**
             * Converts this SpeedController to JSON.
             * @function toJSON
             * @memberof teg_protobufs.MachineMessage.SpeedController
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SpeedController.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return SpeedController;
        })();

        MachineMessage.CommandResponse = (function() {

            /**
             * Properties of a CommandResponse.
             * @memberof teg_protobufs.MachineMessage
             * @interface ICommandResponse
             * @property {number|null} [taskId] CommandResponse taskId
             * @property {number|null} [lineNumber] CommandResponse lineNumber
             * @property {string|null} [content] CommandResponse content
             */

            /**
             * Constructs a new CommandResponse.
             * @memberof teg_protobufs.MachineMessage
             * @classdesc Represents a CommandResponse.
             * @implements ICommandResponse
             * @constructor
             * @param {teg_protobufs.MachineMessage.ICommandResponse=} [properties] Properties to set
             */
            function CommandResponse(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CommandResponse taskId.
             * @member {number} taskId
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @instance
             */
            CommandResponse.prototype.taskId = 0;

            /**
             * CommandResponse lineNumber.
             * @member {number} lineNumber
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @instance
             */
            CommandResponse.prototype.lineNumber = 0;

            /**
             * CommandResponse content.
             * @member {string} content
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @instance
             */
            CommandResponse.prototype.content = "";

            /**
             * Creates a new CommandResponse instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @static
             * @param {teg_protobufs.MachineMessage.ICommandResponse=} [properties] Properties to set
             * @returns {teg_protobufs.MachineMessage.CommandResponse} CommandResponse instance
             */
            CommandResponse.create = function create(properties) {
                return new CommandResponse(properties);
            };

            /**
             * Encodes the specified CommandResponse message. Does not implicitly {@link teg_protobufs.MachineMessage.CommandResponse.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @static
             * @param {teg_protobufs.MachineMessage.ICommandResponse} message CommandResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CommandResponse.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.taskId);
                if (message.lineNumber != null && message.hasOwnProperty("lineNumber"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.lineNumber);
                if (message.content != null && message.hasOwnProperty("content"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.content);
                return writer;
            };

            /**
             * Encodes the specified CommandResponse message, length delimited. Does not implicitly {@link teg_protobufs.MachineMessage.CommandResponse.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @static
             * @param {teg_protobufs.MachineMessage.ICommandResponse} message CommandResponse message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CommandResponse.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CommandResponse message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.MachineMessage.CommandResponse} CommandResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CommandResponse.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.MachineMessage.CommandResponse();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 2:
                        message.taskId = reader.uint32();
                        break;
                    case 3:
                        message.lineNumber = reader.uint32();
                        break;
                    case 4:
                        message.content = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a CommandResponse message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.MachineMessage.CommandResponse} CommandResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CommandResponse.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CommandResponse message.
             * @function verify
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CommandResponse.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    if (!$util.isInteger(message.taskId))
                        return "taskId: integer expected";
                if (message.lineNumber != null && message.hasOwnProperty("lineNumber"))
                    if (!$util.isInteger(message.lineNumber))
                        return "lineNumber: integer expected";
                if (message.content != null && message.hasOwnProperty("content"))
                    if (!$util.isString(message.content))
                        return "content: string expected";
                return null;
            };

            /**
             * Creates a CommandResponse message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.MachineMessage.CommandResponse} CommandResponse
             */
            CommandResponse.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.MachineMessage.CommandResponse)
                    return object;
                var message = new $root.teg_protobufs.MachineMessage.CommandResponse();
                if (object.taskId != null)
                    message.taskId = object.taskId >>> 0;
                if (object.lineNumber != null)
                    message.lineNumber = object.lineNumber >>> 0;
                if (object.content != null)
                    message.content = String(object.content);
                return message;
            };

            /**
             * Creates a plain object from a CommandResponse message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @static
             * @param {teg_protobufs.MachineMessage.CommandResponse} message CommandResponse
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CommandResponse.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.taskId = 0;
                    object.lineNumber = 0;
                    object.content = "";
                }
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    object.taskId = message.taskId;
                if (message.lineNumber != null && message.hasOwnProperty("lineNumber"))
                    object.lineNumber = message.lineNumber;
                if (message.content != null && message.hasOwnProperty("content"))
                    object.content = message.content;
                return object;
            };

            /**
             * Converts this CommandResponse to JSON.
             * @function toJSON
             * @memberof teg_protobufs.MachineMessage.CommandResponse
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CommandResponse.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return CommandResponse;
        })();

        return MachineMessage;
    })();

    teg_protobufs.CombinatorMessage = (function() {

        /**
         * Properties of a CombinatorMessage.
         * @memberof teg_protobufs
         * @interface ICombinatorMessage
         * @property {teg_protobufs.CombinatorMessage.ISetConfig|null} [setConfig] CombinatorMessage setConfig
         * @property {teg_protobufs.CombinatorMessage.ISpoolTask|null} [spoolTask] CombinatorMessage spoolTask
         * @property {teg_protobufs.CombinatorMessage.IPauseTask|null} [pauseTask] CombinatorMessage pauseTask
         * @property {teg_protobufs.CombinatorMessage.IEStop|null} [estop] CombinatorMessage estop
         * @property {teg_protobufs.CombinatorMessage.IReset|null} [reset] CombinatorMessage reset
         * @property {teg_protobufs.CombinatorMessage.IDeleteTaskHistory|null} [deleteTaskHistory] CombinatorMessage deleteTaskHistory
         * @property {teg_protobufs.CombinatorMessage.IDeviceDiscovered|null} [deviceDiscovered] CombinatorMessage deviceDiscovered
         * @property {teg_protobufs.CombinatorMessage.IDeviceDisconnected|null} [deviceDisconnected] CombinatorMessage deviceDisconnected
         */

        /**
         * Constructs a new CombinatorMessage.
         * @memberof teg_protobufs
         * @classdesc Represents a CombinatorMessage.
         * @implements ICombinatorMessage
         * @constructor
         * @param {teg_protobufs.ICombinatorMessage=} [properties] Properties to set
         */
        function CombinatorMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CombinatorMessage setConfig.
         * @member {teg_protobufs.CombinatorMessage.ISetConfig|null|undefined} setConfig
         * @memberof teg_protobufs.CombinatorMessage
         * @instance
         */
        CombinatorMessage.prototype.setConfig = null;

        /**
         * CombinatorMessage spoolTask.
         * @member {teg_protobufs.CombinatorMessage.ISpoolTask|null|undefined} spoolTask
         * @memberof teg_protobufs.CombinatorMessage
         * @instance
         */
        CombinatorMessage.prototype.spoolTask = null;

        /**
         * CombinatorMessage pauseTask.
         * @member {teg_protobufs.CombinatorMessage.IPauseTask|null|undefined} pauseTask
         * @memberof teg_protobufs.CombinatorMessage
         * @instance
         */
        CombinatorMessage.prototype.pauseTask = null;

        /**
         * CombinatorMessage estop.
         * @member {teg_protobufs.CombinatorMessage.IEStop|null|undefined} estop
         * @memberof teg_protobufs.CombinatorMessage
         * @instance
         */
        CombinatorMessage.prototype.estop = null;

        /**
         * CombinatorMessage reset.
         * @member {teg_protobufs.CombinatorMessage.IReset|null|undefined} reset
         * @memberof teg_protobufs.CombinatorMessage
         * @instance
         */
        CombinatorMessage.prototype.reset = null;

        /**
         * CombinatorMessage deleteTaskHistory.
         * @member {teg_protobufs.CombinatorMessage.IDeleteTaskHistory|null|undefined} deleteTaskHistory
         * @memberof teg_protobufs.CombinatorMessage
         * @instance
         */
        CombinatorMessage.prototype.deleteTaskHistory = null;

        /**
         * CombinatorMessage deviceDiscovered.
         * @member {teg_protobufs.CombinatorMessage.IDeviceDiscovered|null|undefined} deviceDiscovered
         * @memberof teg_protobufs.CombinatorMessage
         * @instance
         */
        CombinatorMessage.prototype.deviceDiscovered = null;

        /**
         * CombinatorMessage deviceDisconnected.
         * @member {teg_protobufs.CombinatorMessage.IDeviceDisconnected|null|undefined} deviceDisconnected
         * @memberof teg_protobufs.CombinatorMessage
         * @instance
         */
        CombinatorMessage.prototype.deviceDisconnected = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        /**
         * CombinatorMessage payload.
         * @member {"setConfig"|"spoolTask"|"pauseTask"|"estop"|"reset"|"deleteTaskHistory"|"deviceDiscovered"|"deviceDisconnected"|undefined} payload
         * @memberof teg_protobufs.CombinatorMessage
         * @instance
         */
        Object.defineProperty(CombinatorMessage.prototype, "payload", {
            get: $util.oneOfGetter($oneOfFields = ["setConfig", "spoolTask", "pauseTask", "estop", "reset", "deleteTaskHistory", "deviceDiscovered", "deviceDisconnected"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new CombinatorMessage instance using the specified properties.
         * @function create
         * @memberof teg_protobufs.CombinatorMessage
         * @static
         * @param {teg_protobufs.ICombinatorMessage=} [properties] Properties to set
         * @returns {teg_protobufs.CombinatorMessage} CombinatorMessage instance
         */
        CombinatorMessage.create = function create(properties) {
            return new CombinatorMessage(properties);
        };

        /**
         * Encodes the specified CombinatorMessage message. Does not implicitly {@link teg_protobufs.CombinatorMessage.verify|verify} messages.
         * @function encode
         * @memberof teg_protobufs.CombinatorMessage
         * @static
         * @param {teg_protobufs.ICombinatorMessage} message CombinatorMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CombinatorMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.setConfig != null && message.hasOwnProperty("setConfig"))
                $root.teg_protobufs.CombinatorMessage.SetConfig.encode(message.setConfig, writer.uint32(/* id 9, wireType 2 =*/74).fork()).ldelim();
            if (message.spoolTask != null && message.hasOwnProperty("spoolTask"))
                $root.teg_protobufs.CombinatorMessage.SpoolTask.encode(message.spoolTask, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.pauseTask != null && message.hasOwnProperty("pauseTask"))
                $root.teg_protobufs.CombinatorMessage.PauseTask.encode(message.pauseTask, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            if (message.estop != null && message.hasOwnProperty("estop"))
                $root.teg_protobufs.CombinatorMessage.EStop.encode(message.estop, writer.uint32(/* id 15, wireType 2 =*/122).fork()).ldelim();
            if (message.reset != null && message.hasOwnProperty("reset"))
                $root.teg_protobufs.CombinatorMessage.Reset.encode(message.reset, writer.uint32(/* id 16, wireType 2 =*/130).fork()).ldelim();
            if (message.deleteTaskHistory != null && message.hasOwnProperty("deleteTaskHistory"))
                $root.teg_protobufs.CombinatorMessage.DeleteTaskHistory.encode(message.deleteTaskHistory, writer.uint32(/* id 100, wireType 2 =*/802).fork()).ldelim();
            if (message.deviceDiscovered != null && message.hasOwnProperty("deviceDiscovered"))
                $root.teg_protobufs.CombinatorMessage.DeviceDiscovered.encode(message.deviceDiscovered, writer.uint32(/* id 110, wireType 2 =*/882).fork()).ldelim();
            if (message.deviceDisconnected != null && message.hasOwnProperty("deviceDisconnected"))
                $root.teg_protobufs.CombinatorMessage.DeviceDisconnected.encode(message.deviceDisconnected, writer.uint32(/* id 111, wireType 2 =*/890).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified CombinatorMessage message, length delimited. Does not implicitly {@link teg_protobufs.CombinatorMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof teg_protobufs.CombinatorMessage
         * @static
         * @param {teg_protobufs.ICombinatorMessage} message CombinatorMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CombinatorMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CombinatorMessage message from the specified reader or buffer.
         * @function decode
         * @memberof teg_protobufs.CombinatorMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {teg_protobufs.CombinatorMessage} CombinatorMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CombinatorMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.CombinatorMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 9:
                    message.setConfig = $root.teg_protobufs.CombinatorMessage.SetConfig.decode(reader, reader.uint32());
                    break;
                case 10:
                    message.spoolTask = $root.teg_protobufs.CombinatorMessage.SpoolTask.decode(reader, reader.uint32());
                    break;
                case 11:
                    message.pauseTask = $root.teg_protobufs.CombinatorMessage.PauseTask.decode(reader, reader.uint32());
                    break;
                case 15:
                    message.estop = $root.teg_protobufs.CombinatorMessage.EStop.decode(reader, reader.uint32());
                    break;
                case 16:
                    message.reset = $root.teg_protobufs.CombinatorMessage.Reset.decode(reader, reader.uint32());
                    break;
                case 100:
                    message.deleteTaskHistory = $root.teg_protobufs.CombinatorMessage.DeleteTaskHistory.decode(reader, reader.uint32());
                    break;
                case 110:
                    message.deviceDiscovered = $root.teg_protobufs.CombinatorMessage.DeviceDiscovered.decode(reader, reader.uint32());
                    break;
                case 111:
                    message.deviceDisconnected = $root.teg_protobufs.CombinatorMessage.DeviceDisconnected.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CombinatorMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof teg_protobufs.CombinatorMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {teg_protobufs.CombinatorMessage} CombinatorMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CombinatorMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CombinatorMessage message.
         * @function verify
         * @memberof teg_protobufs.CombinatorMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CombinatorMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            var properties = {};
            if (message.setConfig != null && message.hasOwnProperty("setConfig")) {
                properties.payload = 1;
                {
                    var error = $root.teg_protobufs.CombinatorMessage.SetConfig.verify(message.setConfig);
                    if (error)
                        return "setConfig." + error;
                }
            }
            if (message.spoolTask != null && message.hasOwnProperty("spoolTask")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.teg_protobufs.CombinatorMessage.SpoolTask.verify(message.spoolTask);
                    if (error)
                        return "spoolTask." + error;
                }
            }
            if (message.pauseTask != null && message.hasOwnProperty("pauseTask")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.teg_protobufs.CombinatorMessage.PauseTask.verify(message.pauseTask);
                    if (error)
                        return "pauseTask." + error;
                }
            }
            if (message.estop != null && message.hasOwnProperty("estop")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.teg_protobufs.CombinatorMessage.EStop.verify(message.estop);
                    if (error)
                        return "estop." + error;
                }
            }
            if (message.reset != null && message.hasOwnProperty("reset")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.teg_protobufs.CombinatorMessage.Reset.verify(message.reset);
                    if (error)
                        return "reset." + error;
                }
            }
            if (message.deleteTaskHistory != null && message.hasOwnProperty("deleteTaskHistory")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.teg_protobufs.CombinatorMessage.DeleteTaskHistory.verify(message.deleteTaskHistory);
                    if (error)
                        return "deleteTaskHistory." + error;
                }
            }
            if (message.deviceDiscovered != null && message.hasOwnProperty("deviceDiscovered")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.teg_protobufs.CombinatorMessage.DeviceDiscovered.verify(message.deviceDiscovered);
                    if (error)
                        return "deviceDiscovered." + error;
                }
            }
            if (message.deviceDisconnected != null && message.hasOwnProperty("deviceDisconnected")) {
                if (properties.payload === 1)
                    return "payload: multiple values";
                properties.payload = 1;
                {
                    var error = $root.teg_protobufs.CombinatorMessage.DeviceDisconnected.verify(message.deviceDisconnected);
                    if (error)
                        return "deviceDisconnected." + error;
                }
            }
            return null;
        };

        /**
         * Creates a CombinatorMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof teg_protobufs.CombinatorMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {teg_protobufs.CombinatorMessage} CombinatorMessage
         */
        CombinatorMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.teg_protobufs.CombinatorMessage)
                return object;
            var message = new $root.teg_protobufs.CombinatorMessage();
            if (object.setConfig != null) {
                if (typeof object.setConfig !== "object")
                    throw TypeError(".teg_protobufs.CombinatorMessage.setConfig: object expected");
                message.setConfig = $root.teg_protobufs.CombinatorMessage.SetConfig.fromObject(object.setConfig);
            }
            if (object.spoolTask != null) {
                if (typeof object.spoolTask !== "object")
                    throw TypeError(".teg_protobufs.CombinatorMessage.spoolTask: object expected");
                message.spoolTask = $root.teg_protobufs.CombinatorMessage.SpoolTask.fromObject(object.spoolTask);
            }
            if (object.pauseTask != null) {
                if (typeof object.pauseTask !== "object")
                    throw TypeError(".teg_protobufs.CombinatorMessage.pauseTask: object expected");
                message.pauseTask = $root.teg_protobufs.CombinatorMessage.PauseTask.fromObject(object.pauseTask);
            }
            if (object.estop != null) {
                if (typeof object.estop !== "object")
                    throw TypeError(".teg_protobufs.CombinatorMessage.estop: object expected");
                message.estop = $root.teg_protobufs.CombinatorMessage.EStop.fromObject(object.estop);
            }
            if (object.reset != null) {
                if (typeof object.reset !== "object")
                    throw TypeError(".teg_protobufs.CombinatorMessage.reset: object expected");
                message.reset = $root.teg_protobufs.CombinatorMessage.Reset.fromObject(object.reset);
            }
            if (object.deleteTaskHistory != null) {
                if (typeof object.deleteTaskHistory !== "object")
                    throw TypeError(".teg_protobufs.CombinatorMessage.deleteTaskHistory: object expected");
                message.deleteTaskHistory = $root.teg_protobufs.CombinatorMessage.DeleteTaskHistory.fromObject(object.deleteTaskHistory);
            }
            if (object.deviceDiscovered != null) {
                if (typeof object.deviceDiscovered !== "object")
                    throw TypeError(".teg_protobufs.CombinatorMessage.deviceDiscovered: object expected");
                message.deviceDiscovered = $root.teg_protobufs.CombinatorMessage.DeviceDiscovered.fromObject(object.deviceDiscovered);
            }
            if (object.deviceDisconnected != null) {
                if (typeof object.deviceDisconnected !== "object")
                    throw TypeError(".teg_protobufs.CombinatorMessage.deviceDisconnected: object expected");
                message.deviceDisconnected = $root.teg_protobufs.CombinatorMessage.DeviceDisconnected.fromObject(object.deviceDisconnected);
            }
            return message;
        };

        /**
         * Creates a plain object from a CombinatorMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof teg_protobufs.CombinatorMessage
         * @static
         * @param {teg_protobufs.CombinatorMessage} message CombinatorMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CombinatorMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (message.setConfig != null && message.hasOwnProperty("setConfig")) {
                object.setConfig = $root.teg_protobufs.CombinatorMessage.SetConfig.toObject(message.setConfig, options);
                if (options.oneofs)
                    object.payload = "setConfig";
            }
            if (message.spoolTask != null && message.hasOwnProperty("spoolTask")) {
                object.spoolTask = $root.teg_protobufs.CombinatorMessage.SpoolTask.toObject(message.spoolTask, options);
                if (options.oneofs)
                    object.payload = "spoolTask";
            }
            if (message.pauseTask != null && message.hasOwnProperty("pauseTask")) {
                object.pauseTask = $root.teg_protobufs.CombinatorMessage.PauseTask.toObject(message.pauseTask, options);
                if (options.oneofs)
                    object.payload = "pauseTask";
            }
            if (message.estop != null && message.hasOwnProperty("estop")) {
                object.estop = $root.teg_protobufs.CombinatorMessage.EStop.toObject(message.estop, options);
                if (options.oneofs)
                    object.payload = "estop";
            }
            if (message.reset != null && message.hasOwnProperty("reset")) {
                object.reset = $root.teg_protobufs.CombinatorMessage.Reset.toObject(message.reset, options);
                if (options.oneofs)
                    object.payload = "reset";
            }
            if (message.deleteTaskHistory != null && message.hasOwnProperty("deleteTaskHistory")) {
                object.deleteTaskHistory = $root.teg_protobufs.CombinatorMessage.DeleteTaskHistory.toObject(message.deleteTaskHistory, options);
                if (options.oneofs)
                    object.payload = "deleteTaskHistory";
            }
            if (message.deviceDiscovered != null && message.hasOwnProperty("deviceDiscovered")) {
                object.deviceDiscovered = $root.teg_protobufs.CombinatorMessage.DeviceDiscovered.toObject(message.deviceDiscovered, options);
                if (options.oneofs)
                    object.payload = "deviceDiscovered";
            }
            if (message.deviceDisconnected != null && message.hasOwnProperty("deviceDisconnected")) {
                object.deviceDisconnected = $root.teg_protobufs.CombinatorMessage.DeviceDisconnected.toObject(message.deviceDisconnected, options);
                if (options.oneofs)
                    object.payload = "deviceDisconnected";
            }
            return object;
        };

        /**
         * Converts this CombinatorMessage to JSON.
         * @function toJSON
         * @memberof teg_protobufs.CombinatorMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CombinatorMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        CombinatorMessage.SetConfig = (function() {

            /**
             * Properties of a SetConfig.
             * @memberof teg_protobufs.CombinatorMessage
             * @interface ISetConfig
             * @property {string|null} [filePath] SetConfig filePath
             */

            /**
             * Constructs a new SetConfig.
             * @memberof teg_protobufs.CombinatorMessage
             * @classdesc Represents a SetConfig.
             * @implements ISetConfig
             * @constructor
             * @param {teg_protobufs.CombinatorMessage.ISetConfig=} [properties] Properties to set
             */
            function SetConfig(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SetConfig filePath.
             * @member {string} filePath
             * @memberof teg_protobufs.CombinatorMessage.SetConfig
             * @instance
             */
            SetConfig.prototype.filePath = "";

            /**
             * Creates a new SetConfig instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.CombinatorMessage.SetConfig
             * @static
             * @param {teg_protobufs.CombinatorMessage.ISetConfig=} [properties] Properties to set
             * @returns {teg_protobufs.CombinatorMessage.SetConfig} SetConfig instance
             */
            SetConfig.create = function create(properties) {
                return new SetConfig(properties);
            };

            /**
             * Encodes the specified SetConfig message. Does not implicitly {@link teg_protobufs.CombinatorMessage.SetConfig.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.CombinatorMessage.SetConfig
             * @static
             * @param {teg_protobufs.CombinatorMessage.ISetConfig} message SetConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SetConfig.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.filePath != null && message.hasOwnProperty("filePath"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.filePath);
                return writer;
            };

            /**
             * Encodes the specified SetConfig message, length delimited. Does not implicitly {@link teg_protobufs.CombinatorMessage.SetConfig.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.SetConfig
             * @static
             * @param {teg_protobufs.CombinatorMessage.ISetConfig} message SetConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SetConfig.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SetConfig message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.CombinatorMessage.SetConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.CombinatorMessage.SetConfig} SetConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SetConfig.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.CombinatorMessage.SetConfig();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.filePath = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a SetConfig message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.SetConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.CombinatorMessage.SetConfig} SetConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SetConfig.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SetConfig message.
             * @function verify
             * @memberof teg_protobufs.CombinatorMessage.SetConfig
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SetConfig.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.filePath != null && message.hasOwnProperty("filePath"))
                    if (!$util.isString(message.filePath))
                        return "filePath: string expected";
                return null;
            };

            /**
             * Creates a SetConfig message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.CombinatorMessage.SetConfig
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.CombinatorMessage.SetConfig} SetConfig
             */
            SetConfig.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.CombinatorMessage.SetConfig)
                    return object;
                var message = new $root.teg_protobufs.CombinatorMessage.SetConfig();
                if (object.filePath != null)
                    message.filePath = String(object.filePath);
                return message;
            };

            /**
             * Creates a plain object from a SetConfig message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.CombinatorMessage.SetConfig
             * @static
             * @param {teg_protobufs.CombinatorMessage.SetConfig} message SetConfig
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SetConfig.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.filePath = "";
                if (message.filePath != null && message.hasOwnProperty("filePath"))
                    object.filePath = message.filePath;
                return object;
            };

            /**
             * Converts this SetConfig to JSON.
             * @function toJSON
             * @memberof teg_protobufs.CombinatorMessage.SetConfig
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SetConfig.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return SetConfig;
        })();

        CombinatorMessage.SpoolTask = (function() {

            /**
             * Properties of a SpoolTask.
             * @memberof teg_protobufs.CombinatorMessage
             * @interface ISpoolTask
             * @property {number|null} [taskId] SpoolTask taskId
             * @property {string|null} [filePath] SpoolTask filePath
             * @property {teg_protobufs.CombinatorMessage.IInlineContent|null} [inline] SpoolTask inline
             * @property {boolean|null} [machineOverride] SpoolTask machineOverride
             */

            /**
             * Constructs a new SpoolTask.
             * @memberof teg_protobufs.CombinatorMessage
             * @classdesc Represents a SpoolTask.
             * @implements ISpoolTask
             * @constructor
             * @param {teg_protobufs.CombinatorMessage.ISpoolTask=} [properties] Properties to set
             */
            function SpoolTask(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SpoolTask taskId.
             * @member {number} taskId
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @instance
             */
            SpoolTask.prototype.taskId = 0;

            /**
             * SpoolTask filePath.
             * @member {string} filePath
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @instance
             */
            SpoolTask.prototype.filePath = "";

            /**
             * SpoolTask inline.
             * @member {teg_protobufs.CombinatorMessage.IInlineContent|null|undefined} inline
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @instance
             */
            SpoolTask.prototype.inline = null;

            /**
             * SpoolTask machineOverride.
             * @member {boolean} machineOverride
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @instance
             */
            SpoolTask.prototype.machineOverride = false;

            // OneOf field names bound to virtual getters and setters
            var $oneOfFields;

            /**
             * SpoolTask content.
             * @member {"filePath"|"inline"|undefined} content
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @instance
             */
            Object.defineProperty(SpoolTask.prototype, "content", {
                get: $util.oneOfGetter($oneOfFields = ["filePath", "inline"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            /**
             * Creates a new SpoolTask instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @static
             * @param {teg_protobufs.CombinatorMessage.ISpoolTask=} [properties] Properties to set
             * @returns {teg_protobufs.CombinatorMessage.SpoolTask} SpoolTask instance
             */
            SpoolTask.create = function create(properties) {
                return new SpoolTask(properties);
            };

            /**
             * Encodes the specified SpoolTask message. Does not implicitly {@link teg_protobufs.CombinatorMessage.SpoolTask.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @static
             * @param {teg_protobufs.CombinatorMessage.ISpoolTask} message SpoolTask message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SpoolTask.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.taskId);
                if (message.filePath != null && message.hasOwnProperty("filePath"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.filePath);
                if (message.inline != null && message.hasOwnProperty("inline"))
                    $root.teg_protobufs.CombinatorMessage.InlineContent.encode(message.inline, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                if (message.machineOverride != null && message.hasOwnProperty("machineOverride"))
                    writer.uint32(/* id 9, wireType 0 =*/72).bool(message.machineOverride);
                return writer;
            };

            /**
             * Encodes the specified SpoolTask message, length delimited. Does not implicitly {@link teg_protobufs.CombinatorMessage.SpoolTask.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @static
             * @param {teg_protobufs.CombinatorMessage.ISpoolTask} message SpoolTask message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SpoolTask.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SpoolTask message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.CombinatorMessage.SpoolTask} SpoolTask
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SpoolTask.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.CombinatorMessage.SpoolTask();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.taskId = reader.uint32();
                        break;
                    case 2:
                        message.filePath = reader.string();
                        break;
                    case 3:
                        message.inline = $root.teg_protobufs.CombinatorMessage.InlineContent.decode(reader, reader.uint32());
                        break;
                    case 9:
                        message.machineOverride = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a SpoolTask message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.CombinatorMessage.SpoolTask} SpoolTask
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SpoolTask.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SpoolTask message.
             * @function verify
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SpoolTask.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                var properties = {};
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    if (!$util.isInteger(message.taskId))
                        return "taskId: integer expected";
                if (message.filePath != null && message.hasOwnProperty("filePath")) {
                    properties.content = 1;
                    if (!$util.isString(message.filePath))
                        return "filePath: string expected";
                }
                if (message.inline != null && message.hasOwnProperty("inline")) {
                    if (properties.content === 1)
                        return "content: multiple values";
                    properties.content = 1;
                    {
                        var error = $root.teg_protobufs.CombinatorMessage.InlineContent.verify(message.inline);
                        if (error)
                            return "inline." + error;
                    }
                }
                if (message.machineOverride != null && message.hasOwnProperty("machineOverride"))
                    if (typeof message.machineOverride !== "boolean")
                        return "machineOverride: boolean expected";
                return null;
            };

            /**
             * Creates a SpoolTask message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.CombinatorMessage.SpoolTask} SpoolTask
             */
            SpoolTask.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.CombinatorMessage.SpoolTask)
                    return object;
                var message = new $root.teg_protobufs.CombinatorMessage.SpoolTask();
                if (object.taskId != null)
                    message.taskId = object.taskId >>> 0;
                if (object.filePath != null)
                    message.filePath = String(object.filePath);
                if (object.inline != null) {
                    if (typeof object.inline !== "object")
                        throw TypeError(".teg_protobufs.CombinatorMessage.SpoolTask.inline: object expected");
                    message.inline = $root.teg_protobufs.CombinatorMessage.InlineContent.fromObject(object.inline);
                }
                if (object.machineOverride != null)
                    message.machineOverride = Boolean(object.machineOverride);
                return message;
            };

            /**
             * Creates a plain object from a SpoolTask message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @static
             * @param {teg_protobufs.CombinatorMessage.SpoolTask} message SpoolTask
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SpoolTask.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.taskId = 0;
                    object.machineOverride = false;
                }
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    object.taskId = message.taskId;
                if (message.filePath != null && message.hasOwnProperty("filePath")) {
                    object.filePath = message.filePath;
                    if (options.oneofs)
                        object.content = "filePath";
                }
                if (message.inline != null && message.hasOwnProperty("inline")) {
                    object.inline = $root.teg_protobufs.CombinatorMessage.InlineContent.toObject(message.inline, options);
                    if (options.oneofs)
                        object.content = "inline";
                }
                if (message.machineOverride != null && message.hasOwnProperty("machineOverride"))
                    object.machineOverride = message.machineOverride;
                return object;
            };

            /**
             * Converts this SpoolTask to JSON.
             * @function toJSON
             * @memberof teg_protobufs.CombinatorMessage.SpoolTask
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SpoolTask.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return SpoolTask;
        })();

        CombinatorMessage.InlineContent = (function() {

            /**
             * Properties of an InlineContent.
             * @memberof teg_protobufs.CombinatorMessage
             * @interface IInlineContent
             * @property {Array.<string>|null} [commands] InlineContent commands
             */

            /**
             * Constructs a new InlineContent.
             * @memberof teg_protobufs.CombinatorMessage
             * @classdesc Represents an InlineContent.
             * @implements IInlineContent
             * @constructor
             * @param {teg_protobufs.CombinatorMessage.IInlineContent=} [properties] Properties to set
             */
            function InlineContent(properties) {
                this.commands = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * InlineContent commands.
             * @member {Array.<string>} commands
             * @memberof teg_protobufs.CombinatorMessage.InlineContent
             * @instance
             */
            InlineContent.prototype.commands = $util.emptyArray;

            /**
             * Creates a new InlineContent instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.CombinatorMessage.InlineContent
             * @static
             * @param {teg_protobufs.CombinatorMessage.IInlineContent=} [properties] Properties to set
             * @returns {teg_protobufs.CombinatorMessage.InlineContent} InlineContent instance
             */
            InlineContent.create = function create(properties) {
                return new InlineContent(properties);
            };

            /**
             * Encodes the specified InlineContent message. Does not implicitly {@link teg_protobufs.CombinatorMessage.InlineContent.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.CombinatorMessage.InlineContent
             * @static
             * @param {teg_protobufs.CombinatorMessage.IInlineContent} message InlineContent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InlineContent.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.commands != null && message.commands.length)
                    for (var i = 0; i < message.commands.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.commands[i]);
                return writer;
            };

            /**
             * Encodes the specified InlineContent message, length delimited. Does not implicitly {@link teg_protobufs.CombinatorMessage.InlineContent.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.InlineContent
             * @static
             * @param {teg_protobufs.CombinatorMessage.IInlineContent} message InlineContent message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            InlineContent.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an InlineContent message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.CombinatorMessage.InlineContent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.CombinatorMessage.InlineContent} InlineContent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            InlineContent.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.CombinatorMessage.InlineContent();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 3:
                        if (!(message.commands && message.commands.length))
                            message.commands = [];
                        message.commands.push(reader.string());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an InlineContent message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.InlineContent
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.CombinatorMessage.InlineContent} InlineContent
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            InlineContent.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an InlineContent message.
             * @function verify
             * @memberof teg_protobufs.CombinatorMessage.InlineContent
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            InlineContent.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.commands != null && message.hasOwnProperty("commands")) {
                    if (!Array.isArray(message.commands))
                        return "commands: array expected";
                    for (var i = 0; i < message.commands.length; ++i)
                        if (!$util.isString(message.commands[i]))
                            return "commands: string[] expected";
                }
                return null;
            };

            /**
             * Creates an InlineContent message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.CombinatorMessage.InlineContent
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.CombinatorMessage.InlineContent} InlineContent
             */
            InlineContent.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.CombinatorMessage.InlineContent)
                    return object;
                var message = new $root.teg_protobufs.CombinatorMessage.InlineContent();
                if (object.commands) {
                    if (!Array.isArray(object.commands))
                        throw TypeError(".teg_protobufs.CombinatorMessage.InlineContent.commands: array expected");
                    message.commands = [];
                    for (var i = 0; i < object.commands.length; ++i)
                        message.commands[i] = String(object.commands[i]);
                }
                return message;
            };

            /**
             * Creates a plain object from an InlineContent message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.CombinatorMessage.InlineContent
             * @static
             * @param {teg_protobufs.CombinatorMessage.InlineContent} message InlineContent
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            InlineContent.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.commands = [];
                if (message.commands && message.commands.length) {
                    object.commands = [];
                    for (var j = 0; j < message.commands.length; ++j)
                        object.commands[j] = message.commands[j];
                }
                return object;
            };

            /**
             * Converts this InlineContent to JSON.
             * @function toJSON
             * @memberof teg_protobufs.CombinatorMessage.InlineContent
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            InlineContent.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return InlineContent;
        })();

        CombinatorMessage.PauseTask = (function() {

            /**
             * Properties of a PauseTask.
             * @memberof teg_protobufs.CombinatorMessage
             * @interface IPauseTask
             * @property {number|null} [taskId] PauseTask taskId
             */

            /**
             * Constructs a new PauseTask.
             * @memberof teg_protobufs.CombinatorMessage
             * @classdesc Represents a PauseTask.
             * @implements IPauseTask
             * @constructor
             * @param {teg_protobufs.CombinatorMessage.IPauseTask=} [properties] Properties to set
             */
            function PauseTask(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * PauseTask taskId.
             * @member {number} taskId
             * @memberof teg_protobufs.CombinatorMessage.PauseTask
             * @instance
             */
            PauseTask.prototype.taskId = 0;

            /**
             * Creates a new PauseTask instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.CombinatorMessage.PauseTask
             * @static
             * @param {teg_protobufs.CombinatorMessage.IPauseTask=} [properties] Properties to set
             * @returns {teg_protobufs.CombinatorMessage.PauseTask} PauseTask instance
             */
            PauseTask.create = function create(properties) {
                return new PauseTask(properties);
            };

            /**
             * Encodes the specified PauseTask message. Does not implicitly {@link teg_protobufs.CombinatorMessage.PauseTask.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.CombinatorMessage.PauseTask
             * @static
             * @param {teg_protobufs.CombinatorMessage.IPauseTask} message PauseTask message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PauseTask.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.taskId);
                return writer;
            };

            /**
             * Encodes the specified PauseTask message, length delimited. Does not implicitly {@link teg_protobufs.CombinatorMessage.PauseTask.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.PauseTask
             * @static
             * @param {teg_protobufs.CombinatorMessage.IPauseTask} message PauseTask message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PauseTask.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PauseTask message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.CombinatorMessage.PauseTask
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.CombinatorMessage.PauseTask} PauseTask
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PauseTask.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.CombinatorMessage.PauseTask();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.taskId = reader.uint32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a PauseTask message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.PauseTask
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.CombinatorMessage.PauseTask} PauseTask
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PauseTask.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a PauseTask message.
             * @function verify
             * @memberof teg_protobufs.CombinatorMessage.PauseTask
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PauseTask.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    if (!$util.isInteger(message.taskId))
                        return "taskId: integer expected";
                return null;
            };

            /**
             * Creates a PauseTask message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.CombinatorMessage.PauseTask
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.CombinatorMessage.PauseTask} PauseTask
             */
            PauseTask.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.CombinatorMessage.PauseTask)
                    return object;
                var message = new $root.teg_protobufs.CombinatorMessage.PauseTask();
                if (object.taskId != null)
                    message.taskId = object.taskId >>> 0;
                return message;
            };

            /**
             * Creates a plain object from a PauseTask message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.CombinatorMessage.PauseTask
             * @static
             * @param {teg_protobufs.CombinatorMessage.PauseTask} message PauseTask
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PauseTask.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.taskId = 0;
                if (message.taskId != null && message.hasOwnProperty("taskId"))
                    object.taskId = message.taskId;
                return object;
            };

            /**
             * Converts this PauseTask to JSON.
             * @function toJSON
             * @memberof teg_protobufs.CombinatorMessage.PauseTask
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PauseTask.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return PauseTask;
        })();

        CombinatorMessage.DeviceDiscovered = (function() {

            /**
             * Properties of a DeviceDiscovered.
             * @memberof teg_protobufs.CombinatorMessage
             * @interface IDeviceDiscovered
             * @property {string|null} [devicePath] DeviceDiscovered devicePath
             */

            /**
             * Constructs a new DeviceDiscovered.
             * @memberof teg_protobufs.CombinatorMessage
             * @classdesc Represents a DeviceDiscovered.
             * @implements IDeviceDiscovered
             * @constructor
             * @param {teg_protobufs.CombinatorMessage.IDeviceDiscovered=} [properties] Properties to set
             */
            function DeviceDiscovered(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeviceDiscovered devicePath.
             * @member {string} devicePath
             * @memberof teg_protobufs.CombinatorMessage.DeviceDiscovered
             * @instance
             */
            DeviceDiscovered.prototype.devicePath = "";

            /**
             * Creates a new DeviceDiscovered instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.CombinatorMessage.DeviceDiscovered
             * @static
             * @param {teg_protobufs.CombinatorMessage.IDeviceDiscovered=} [properties] Properties to set
             * @returns {teg_protobufs.CombinatorMessage.DeviceDiscovered} DeviceDiscovered instance
             */
            DeviceDiscovered.create = function create(properties) {
                return new DeviceDiscovered(properties);
            };

            /**
             * Encodes the specified DeviceDiscovered message. Does not implicitly {@link teg_protobufs.CombinatorMessage.DeviceDiscovered.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.CombinatorMessage.DeviceDiscovered
             * @static
             * @param {teg_protobufs.CombinatorMessage.IDeviceDiscovered} message DeviceDiscovered message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeviceDiscovered.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.devicePath != null && message.hasOwnProperty("devicePath"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.devicePath);
                return writer;
            };

            /**
             * Encodes the specified DeviceDiscovered message, length delimited. Does not implicitly {@link teg_protobufs.CombinatorMessage.DeviceDiscovered.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.DeviceDiscovered
             * @static
             * @param {teg_protobufs.CombinatorMessage.IDeviceDiscovered} message DeviceDiscovered message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeviceDiscovered.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeviceDiscovered message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.CombinatorMessage.DeviceDiscovered
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.CombinatorMessage.DeviceDiscovered} DeviceDiscovered
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeviceDiscovered.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.CombinatorMessage.DeviceDiscovered();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.devicePath = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DeviceDiscovered message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.DeviceDiscovered
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.CombinatorMessage.DeviceDiscovered} DeviceDiscovered
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeviceDiscovered.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeviceDiscovered message.
             * @function verify
             * @memberof teg_protobufs.CombinatorMessage.DeviceDiscovered
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeviceDiscovered.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.devicePath != null && message.hasOwnProperty("devicePath"))
                    if (!$util.isString(message.devicePath))
                        return "devicePath: string expected";
                return null;
            };

            /**
             * Creates a DeviceDiscovered message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.CombinatorMessage.DeviceDiscovered
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.CombinatorMessage.DeviceDiscovered} DeviceDiscovered
             */
            DeviceDiscovered.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.CombinatorMessage.DeviceDiscovered)
                    return object;
                var message = new $root.teg_protobufs.CombinatorMessage.DeviceDiscovered();
                if (object.devicePath != null)
                    message.devicePath = String(object.devicePath);
                return message;
            };

            /**
             * Creates a plain object from a DeviceDiscovered message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.CombinatorMessage.DeviceDiscovered
             * @static
             * @param {teg_protobufs.CombinatorMessage.DeviceDiscovered} message DeviceDiscovered
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeviceDiscovered.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.devicePath = "";
                if (message.devicePath != null && message.hasOwnProperty("devicePath"))
                    object.devicePath = message.devicePath;
                return object;
            };

            /**
             * Converts this DeviceDiscovered to JSON.
             * @function toJSON
             * @memberof teg_protobufs.CombinatorMessage.DeviceDiscovered
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeviceDiscovered.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return DeviceDiscovered;
        })();

        CombinatorMessage.DeviceDisconnected = (function() {

            /**
             * Properties of a DeviceDisconnected.
             * @memberof teg_protobufs.CombinatorMessage
             * @interface IDeviceDisconnected
             * @property {string|null} [devicePath] DeviceDisconnected devicePath
             */

            /**
             * Constructs a new DeviceDisconnected.
             * @memberof teg_protobufs.CombinatorMessage
             * @classdesc Represents a DeviceDisconnected.
             * @implements IDeviceDisconnected
             * @constructor
             * @param {teg_protobufs.CombinatorMessage.IDeviceDisconnected=} [properties] Properties to set
             */
            function DeviceDisconnected(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeviceDisconnected devicePath.
             * @member {string} devicePath
             * @memberof teg_protobufs.CombinatorMessage.DeviceDisconnected
             * @instance
             */
            DeviceDisconnected.prototype.devicePath = "";

            /**
             * Creates a new DeviceDisconnected instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.CombinatorMessage.DeviceDisconnected
             * @static
             * @param {teg_protobufs.CombinatorMessage.IDeviceDisconnected=} [properties] Properties to set
             * @returns {teg_protobufs.CombinatorMessage.DeviceDisconnected} DeviceDisconnected instance
             */
            DeviceDisconnected.create = function create(properties) {
                return new DeviceDisconnected(properties);
            };

            /**
             * Encodes the specified DeviceDisconnected message. Does not implicitly {@link teg_protobufs.CombinatorMessage.DeviceDisconnected.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.CombinatorMessage.DeviceDisconnected
             * @static
             * @param {teg_protobufs.CombinatorMessage.IDeviceDisconnected} message DeviceDisconnected message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeviceDisconnected.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.devicePath != null && message.hasOwnProperty("devicePath"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.devicePath);
                return writer;
            };

            /**
             * Encodes the specified DeviceDisconnected message, length delimited. Does not implicitly {@link teg_protobufs.CombinatorMessage.DeviceDisconnected.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.DeviceDisconnected
             * @static
             * @param {teg_protobufs.CombinatorMessage.IDeviceDisconnected} message DeviceDisconnected message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeviceDisconnected.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeviceDisconnected message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.CombinatorMessage.DeviceDisconnected
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.CombinatorMessage.DeviceDisconnected} DeviceDisconnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeviceDisconnected.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.CombinatorMessage.DeviceDisconnected();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.devicePath = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DeviceDisconnected message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.DeviceDisconnected
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.CombinatorMessage.DeviceDisconnected} DeviceDisconnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeviceDisconnected.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeviceDisconnected message.
             * @function verify
             * @memberof teg_protobufs.CombinatorMessage.DeviceDisconnected
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeviceDisconnected.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.devicePath != null && message.hasOwnProperty("devicePath"))
                    if (!$util.isString(message.devicePath))
                        return "devicePath: string expected";
                return null;
            };

            /**
             * Creates a DeviceDisconnected message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.CombinatorMessage.DeviceDisconnected
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.CombinatorMessage.DeviceDisconnected} DeviceDisconnected
             */
            DeviceDisconnected.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.CombinatorMessage.DeviceDisconnected)
                    return object;
                var message = new $root.teg_protobufs.CombinatorMessage.DeviceDisconnected();
                if (object.devicePath != null)
                    message.devicePath = String(object.devicePath);
                return message;
            };

            /**
             * Creates a plain object from a DeviceDisconnected message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.CombinatorMessage.DeviceDisconnected
             * @static
             * @param {teg_protobufs.CombinatorMessage.DeviceDisconnected} message DeviceDisconnected
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeviceDisconnected.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.devicePath = "";
                if (message.devicePath != null && message.hasOwnProperty("devicePath"))
                    object.devicePath = message.devicePath;
                return object;
            };

            /**
             * Converts this DeviceDisconnected to JSON.
             * @function toJSON
             * @memberof teg_protobufs.CombinatorMessage.DeviceDisconnected
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeviceDisconnected.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return DeviceDisconnected;
        })();

        CombinatorMessage.EStop = (function() {

            /**
             * Properties of a EStop.
             * @memberof teg_protobufs.CombinatorMessage
             * @interface IEStop
             */

            /**
             * Constructs a new EStop.
             * @memberof teg_protobufs.CombinatorMessage
             * @classdesc Represents a EStop.
             * @implements IEStop
             * @constructor
             * @param {teg_protobufs.CombinatorMessage.IEStop=} [properties] Properties to set
             */
            function EStop(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new EStop instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.CombinatorMessage.EStop
             * @static
             * @param {teg_protobufs.CombinatorMessage.IEStop=} [properties] Properties to set
             * @returns {teg_protobufs.CombinatorMessage.EStop} EStop instance
             */
            EStop.create = function create(properties) {
                return new EStop(properties);
            };

            /**
             * Encodes the specified EStop message. Does not implicitly {@link teg_protobufs.CombinatorMessage.EStop.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.CombinatorMessage.EStop
             * @static
             * @param {teg_protobufs.CombinatorMessage.IEStop} message EStop message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EStop.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified EStop message, length delimited. Does not implicitly {@link teg_protobufs.CombinatorMessage.EStop.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.EStop
             * @static
             * @param {teg_protobufs.CombinatorMessage.IEStop} message EStop message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EStop.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a EStop message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.CombinatorMessage.EStop
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.CombinatorMessage.EStop} EStop
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EStop.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.CombinatorMessage.EStop();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a EStop message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.EStop
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.CombinatorMessage.EStop} EStop
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EStop.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a EStop message.
             * @function verify
             * @memberof teg_protobufs.CombinatorMessage.EStop
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EStop.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates a EStop message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.CombinatorMessage.EStop
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.CombinatorMessage.EStop} EStop
             */
            EStop.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.CombinatorMessage.EStop)
                    return object;
                return new $root.teg_protobufs.CombinatorMessage.EStop();
            };

            /**
             * Creates a plain object from a EStop message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.CombinatorMessage.EStop
             * @static
             * @param {teg_protobufs.CombinatorMessage.EStop} message EStop
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EStop.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this EStop to JSON.
             * @function toJSON
             * @memberof teg_protobufs.CombinatorMessage.EStop
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EStop.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return EStop;
        })();

        CombinatorMessage.Reset = (function() {

            /**
             * Properties of a Reset.
             * @memberof teg_protobufs.CombinatorMessage
             * @interface IReset
             */

            /**
             * Constructs a new Reset.
             * @memberof teg_protobufs.CombinatorMessage
             * @classdesc Represents a Reset.
             * @implements IReset
             * @constructor
             * @param {teg_protobufs.CombinatorMessage.IReset=} [properties] Properties to set
             */
            function Reset(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new Reset instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.CombinatorMessage.Reset
             * @static
             * @param {teg_protobufs.CombinatorMessage.IReset=} [properties] Properties to set
             * @returns {teg_protobufs.CombinatorMessage.Reset} Reset instance
             */
            Reset.create = function create(properties) {
                return new Reset(properties);
            };

            /**
             * Encodes the specified Reset message. Does not implicitly {@link teg_protobufs.CombinatorMessage.Reset.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.CombinatorMessage.Reset
             * @static
             * @param {teg_protobufs.CombinatorMessage.IReset} message Reset message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Reset.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified Reset message, length delimited. Does not implicitly {@link teg_protobufs.CombinatorMessage.Reset.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.Reset
             * @static
             * @param {teg_protobufs.CombinatorMessage.IReset} message Reset message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Reset.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Reset message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.CombinatorMessage.Reset
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.CombinatorMessage.Reset} Reset
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Reset.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.CombinatorMessage.Reset();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Reset message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.Reset
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.CombinatorMessage.Reset} Reset
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Reset.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Reset message.
             * @function verify
             * @memberof teg_protobufs.CombinatorMessage.Reset
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Reset.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates a Reset message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.CombinatorMessage.Reset
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.CombinatorMessage.Reset} Reset
             */
            Reset.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.CombinatorMessage.Reset)
                    return object;
                return new $root.teg_protobufs.CombinatorMessage.Reset();
            };

            /**
             * Creates a plain object from a Reset message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.CombinatorMessage.Reset
             * @static
             * @param {teg_protobufs.CombinatorMessage.Reset} message Reset
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Reset.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this Reset to JSON.
             * @function toJSON
             * @memberof teg_protobufs.CombinatorMessage.Reset
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Reset.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Reset;
        })();

        CombinatorMessage.DeleteTaskHistory = (function() {

            /**
             * Properties of a DeleteTaskHistory.
             * @memberof teg_protobufs.CombinatorMessage
             * @interface IDeleteTaskHistory
             * @property {Array.<number>|null} [taskIds] DeleteTaskHistory taskIds
             */

            /**
             * Constructs a new DeleteTaskHistory.
             * @memberof teg_protobufs.CombinatorMessage
             * @classdesc Represents a DeleteTaskHistory.
             * @implements IDeleteTaskHistory
             * @constructor
             * @param {teg_protobufs.CombinatorMessage.IDeleteTaskHistory=} [properties] Properties to set
             */
            function DeleteTaskHistory(properties) {
                this.taskIds = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DeleteTaskHistory taskIds.
             * @member {Array.<number>} taskIds
             * @memberof teg_protobufs.CombinatorMessage.DeleteTaskHistory
             * @instance
             */
            DeleteTaskHistory.prototype.taskIds = $util.emptyArray;

            /**
             * Creates a new DeleteTaskHistory instance using the specified properties.
             * @function create
             * @memberof teg_protobufs.CombinatorMessage.DeleteTaskHistory
             * @static
             * @param {teg_protobufs.CombinatorMessage.IDeleteTaskHistory=} [properties] Properties to set
             * @returns {teg_protobufs.CombinatorMessage.DeleteTaskHistory} DeleteTaskHistory instance
             */
            DeleteTaskHistory.create = function create(properties) {
                return new DeleteTaskHistory(properties);
            };

            /**
             * Encodes the specified DeleteTaskHistory message. Does not implicitly {@link teg_protobufs.CombinatorMessage.DeleteTaskHistory.verify|verify} messages.
             * @function encode
             * @memberof teg_protobufs.CombinatorMessage.DeleteTaskHistory
             * @static
             * @param {teg_protobufs.CombinatorMessage.IDeleteTaskHistory} message DeleteTaskHistory message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTaskHistory.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.taskIds != null && message.taskIds.length) {
                    writer.uint32(/* id 1, wireType 2 =*/10).fork();
                    for (var i = 0; i < message.taskIds.length; ++i)
                        writer.uint32(message.taskIds[i]);
                    writer.ldelim();
                }
                return writer;
            };

            /**
             * Encodes the specified DeleteTaskHistory message, length delimited. Does not implicitly {@link teg_protobufs.CombinatorMessage.DeleteTaskHistory.verify|verify} messages.
             * @function encodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.DeleteTaskHistory
             * @static
             * @param {teg_protobufs.CombinatorMessage.IDeleteTaskHistory} message DeleteTaskHistory message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DeleteTaskHistory.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DeleteTaskHistory message from the specified reader or buffer.
             * @function decode
             * @memberof teg_protobufs.CombinatorMessage.DeleteTaskHistory
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {teg_protobufs.CombinatorMessage.DeleteTaskHistory} DeleteTaskHistory
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteTaskHistory.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.teg_protobufs.CombinatorMessage.DeleteTaskHistory();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.taskIds && message.taskIds.length))
                            message.taskIds = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.taskIds.push(reader.uint32());
                        } else
                            message.taskIds.push(reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DeleteTaskHistory message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof teg_protobufs.CombinatorMessage.DeleteTaskHistory
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {teg_protobufs.CombinatorMessage.DeleteTaskHistory} DeleteTaskHistory
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DeleteTaskHistory.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DeleteTaskHistory message.
             * @function verify
             * @memberof teg_protobufs.CombinatorMessage.DeleteTaskHistory
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DeleteTaskHistory.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.taskIds != null && message.hasOwnProperty("taskIds")) {
                    if (!Array.isArray(message.taskIds))
                        return "taskIds: array expected";
                    for (var i = 0; i < message.taskIds.length; ++i)
                        if (!$util.isInteger(message.taskIds[i]))
                            return "taskIds: integer[] expected";
                }
                return null;
            };

            /**
             * Creates a DeleteTaskHistory message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof teg_protobufs.CombinatorMessage.DeleteTaskHistory
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {teg_protobufs.CombinatorMessage.DeleteTaskHistory} DeleteTaskHistory
             */
            DeleteTaskHistory.fromObject = function fromObject(object) {
                if (object instanceof $root.teg_protobufs.CombinatorMessage.DeleteTaskHistory)
                    return object;
                var message = new $root.teg_protobufs.CombinatorMessage.DeleteTaskHistory();
                if (object.taskIds) {
                    if (!Array.isArray(object.taskIds))
                        throw TypeError(".teg_protobufs.CombinatorMessage.DeleteTaskHistory.taskIds: array expected");
                    message.taskIds = [];
                    for (var i = 0; i < object.taskIds.length; ++i)
                        message.taskIds[i] = object.taskIds[i] >>> 0;
                }
                return message;
            };

            /**
             * Creates a plain object from a DeleteTaskHistory message. Also converts values to other types if specified.
             * @function toObject
             * @memberof teg_protobufs.CombinatorMessage.DeleteTaskHistory
             * @static
             * @param {teg_protobufs.CombinatorMessage.DeleteTaskHistory} message DeleteTaskHistory
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DeleteTaskHistory.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.taskIds = [];
                if (message.taskIds && message.taskIds.length) {
                    object.taskIds = [];
                    for (var j = 0; j < message.taskIds.length; ++j)
                        object.taskIds[j] = message.taskIds[j];
                }
                return object;
            };

            /**
             * Converts this DeleteTaskHistory to JSON.
             * @function toJSON
             * @memberof teg_protobufs.CombinatorMessage.DeleteTaskHistory
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DeleteTaskHistory.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return DeleteTaskHistory;
        })();

        return CombinatorMessage;
    })();

    return teg_protobufs;
})();

module.exports = $root;
