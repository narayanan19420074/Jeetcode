import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Problem } from '../models/Problem.js';
import { slugify } from '../utils/slugify.js';
import { logger } from '../utils/logger.js';

const problems = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    companies: ['Amazon', 'Google', 'Adobe'],
    description:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],

    starterCode: {
      javascript: `function twoSum(nums, target) {\n  \n}`,
      python: `class Solution:\n    def twoSum(self, nums, target):\n        `,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`,
    },

    // Driver notes:
    // stdin  line 1 = nums as a JSON array, line 2 = target integer.
    // stdout = result as a JSON array with NO spaces, e.g. "[0,1]" —
    // every language is made to format output identically so Judge0's
    // exact-string comparison works across languages.
    driverCode: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });
let lines = [];
rl.on('line', (l) => lines.push(l));
rl.on('close', () => {
  const nums = JSON.parse(lines[0]);
  const target = parseInt(lines[1], 10);

/*__USER_CODE__*/

  const result = twoSum(nums, target);
  console.log(JSON.stringify(result));
});`,
      python: `import sys, json

/*__USER_CODE__*/

def main():
    data = sys.stdin.read().split('\\n')
    nums = json.loads(data[0])
    target = int(data[1])
    sol = Solution()
    result = sol.twoSum(nums, target)
    print(json.dumps(result, separators=(',', ':')))

main()`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

/*__USER_CODE__*/

vector<int> parseIntArray(const string& s) {
    vector<int> result;
    string num;
    for (char c : s) {
        if (c == '[' || c == ']' || c == ',') {
            if (!num.empty()) { result.push_back(stoi(num)); num.clear(); }
        } else if (!isspace((unsigned char)c)) {
            num += c;
        }
    }
    if (!num.empty()) result.push_back(stoi(num));
    return result;
}

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    vector<int> nums = parseIntArray(line1);
    int target = stoi(line2);
    Solution sol;
    vector<int> result = sol.twoSum(nums, target);
    cout << "[";
    for (size_t i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i + 1 < result.size()) cout << ",";
    }
    cout << "]" << endl;
    return 0;
}`,
    },

    testCases: [
      { stdin: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isSample: true },
      { stdin: '[3,2,4]\n6', expectedOutput: '[1,2]', isSample: true },
      { stdin: '[3,3]\n6', expectedOutput: '[0,1]', isSample: false },
      { stdin: '[1,5,3,8,2]\n10', expectedOutput: '[2,3]', isSample: false },
    ],
    isPublished: true,
  },

  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    companies: ['Amazon', 'Facebook'],
    description:
      "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid — every open bracket must be closed by the same type of bracket, in the correct order.",
    examples: [{ input: 's = "()[]{}"', output: 'true' }],
    constraints: ['1 <= s.length <= 10^4'],

    starterCode: {
      javascript: `function isValid(s) {\n  \n}`,
      python: `class Solution:\n    def isValid(self, s):\n        `,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};`,
    },

    // stdin = the string on one line. stdout = "true" or "false", lowercase,
    // consistent across all three languages.
    driverCode: {
      javascript: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });
let lines = [];
rl.on('line', (l) => lines.push(l));
rl.on('close', () => {
  const s = lines[0] ?? '';

/*__USER_CODE__*/

  const result = isValid(s);
  console.log(result);
});`,
      python: `import sys

/*__USER_CODE__*/

def main():
    s = sys.stdin.readline().rstrip('\\n')
    sol = Solution()
    result = sol.isValid(s)
    print(str(result).lower())

main()`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

/*__USER_CODE__*/

int main() {
    string s;
    getline(cin, s);
    Solution sol;
    bool result = sol.isValid(s);
    cout << (result ? "true" : "false") << endl;
    return 0;
}`,
    },

    testCases: [
      { stdin: '()[]{}', expectedOutput: 'true', isSample: true },
      { stdin: '(]', expectedOutput: 'false', isSample: true },
      { stdin: '([{}])', expectedOutput: 'true', isSample: false },
      { stdin: '(((', expectedOutput: 'false', isSample: false },
    ],
    isPublished: true,
  },
];

async function seed() {
  await connectDB();

  let admin = await User.findOne({ email: 'admin@jeetcode.dev' });
  if (!admin) {
    const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
    admin = await User.create({
      name: 'JeetCode Admin',
      handle: 'jeetcode_admin',
      email: 'admin@jeetcode.dev',
      passwordHash,
      role: 'admin',
    });
    logger.info('Created admin user: admin@jeetcode.dev / ChangeMe123! (CHANGE THIS PASSWORD)');
  }

  for (const p of problems) {
    const slug = slugify(p.title);
    const exists = await Problem.findOne({ slug });
    if (exists) {
      logger.info(`Skipping "${p.title}" — already seeded`);
      continue;
    }
    await Problem.create({ ...p, slug, createdBy: admin._id });
    logger.info(`Seeded problem: ${p.title}`);
  }

  await disconnectDB();
  logger.info('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed', err);
  process.exit(1);
});
