"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactusErrorCode = exports.FactusError = exports.Factus = void 0;
// Public API
var Factus_1 = require("./Factus");
Object.defineProperty(exports, "Factus", { enumerable: true, get: function () { return Factus_1.Factus; } });
// Errors
var errors_1 = require("./core/errors");
Object.defineProperty(exports, "FactusError", { enumerable: true, get: function () { return errors_1.FactusError; } });
Object.defineProperty(exports, "FactusErrorCode", { enumerable: true, get: function () { return errors_1.FactusErrorCode; } });
//# sourceMappingURL=index.js.map