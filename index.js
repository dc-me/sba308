// The provided course information.
const CourseInfo = {
  id: 451,
  name: 'Introduction to JavaScript',
};

// The provided assignment group.
const AssignmentGroup = {
  id: 12345,
  name: 'Fundamentals of JavaScript',
  course_id: 451,
  group_weight: 25,
  assignments: [
    {
      id: 1,
      name: 'Declare a Variable',
      due_at: '2023-01-25',
      points_possible: 50,
    },
    {
      id: 2,
      name: 'Write a Function',
      due_at: '2023-02-27',
      points_possible: 150,
    },
    {
      id: 3,
      name: 'Code the World',
      due_at: '3156-11-15',
      points_possible: 500,
    },
  ],
};

// The provided learner submission data.
const LearnerSubmissions = [
  {
    learner_id: 125,
    assignment_id: 1,
    submission: {
      submitted_at: '2023-01-25',
      score: 47,
    },
  },
  {
    learner_id: 125,
    assignment_id: 2,
    submission: {
      submitted_at: '2023-02-27',
      score: 150,
    },
  },
  {
    learner_id: 125,
    assignment_id: 3,
    submission: {
      submitted_at: '2023-01-25',
      score: 400,
    },
  },
  {
    learner_id: 132,
    assignment_id: 1,
    submission: {
      submitted_at: '2023-01-24',
      score: 39,
    },
  },
  {
    learner_id: 132,
    assignment_id: 2,
    submission: {
      submitted_at: '2023-03-07',
      score: 140,
    },
  },
];

function getLearnerData(course, ag, submissions) {
  // here, we would process this data to achieve the desired result.
  const result = [];
  let learnerSubmissions;
  try {
    learnerSubmissions = processSubmissions(ag, submissions);
  } catch (error) {
    console.log('Process submissions error!');
  }

  for (learner of learnerSubmissions) {
    let totalScore = 0,
      totalHighestScore = 0;
    const report = {
      id: learner.id,
    };
    for (sub of learner.submissions) {
      let dueAt = Date.parse(sub.assignment.due_at),
        submittedAt = Date.parse(sub.submitted_at);
      if (Object.is(dueAt, NaN) || Object.is(submittedAt, NaN)) {
        console.error(
          `Error while try to parse assignment due_at or submitted_at, not a valid date. learner_id: ${learner.id} assignment: ${sub.assignment.id}. Skip to next submission`
        );
        continue;
      }
      if (
        typeof sub.assignment.points_possible !== 'number' ||
        typeof sub.score !== 'number'
      ) {
        throw 'Data exception, score and points_possible should be numbers!';
      }
      if (sub.assignment.points_possible <= 0) {
        throw 'Data exception, points_possible should be greater than zero.';
      }
      if (dueAt > submittedAt) {
        console.log(
          `learner_id: ${learner.id} assignment: ${sub.assignment.id}. Not due yet, Skip.`
        );
        continue;
      }
      let score = sub.score;
      if (submittedAt > dueAt) {
        console.log(
          `learner_id: ${learner.id} assignment: ${sub.assignment.id}. Late submission, minus 10 percent of points possible.`
        );
        score -= sub.assignment.points_possible * 0.1;
      }

      totalScore += score;
      totalHighestScore += sub.assignment.points_possible;
      report[sub.assignment.id] = toFixedNumber(
        score / sub.assignment.points_possible
      );
    }
    report.avg = toFixedNumber(totalScore / totalHighestScore);
    result.push(report);
  }

  // const result = [
  //   {
  //     id: 125,
  //     avg: 0.985, // (47 + 150) / (50 + 150)
  //     1: 0.94, // 47 / 50
  //     2: 1.0, // 150 / 150
  //   },
  //   {
  //     id: 132,
  //     avg: 0.82, // (39 + 125) / (50 + 150)
  //     1: 0.78, // 39 / 50
  //     2: 0.833, // late: (140 - 15) / 150
  //   },
  // ];

  return result;
}

const result = getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions);

console.log('===================== Result ======================');
console.log(result);

/**
 * process individual learner submission into an array of submissions connected with assignment object.
 * @param {*} ag assignment group
 * @param {*} submissions learner submission
 * @returns learner object with submissions connected with assignment
 * [
 *    id: learnerID,
 *    submissions:[
 *      submitted_at: '2023-01-25',
        score: 47,
        assignment: {
          id: 2,
          name: 'Write a Function',
          due_at: '2023-02-27',
          points_possible: 150,
        }
 *    ]
 * ]
 */
function processSubmissions(ag, submissions) {
  if (typeof ag !== 'object') {
    throw new Error('AssignmentGroup is not valid');
  } else {
    if (!ag.assignments instanceof Array) {
      throw "AssignmentGroup's assignemnts is not an array";
    } else {
      if (ag.assignments.length === 0) {
        // no assignments we have no data to produce.
        return [];
      }
    }
  }
  if (!submissions instanceof Array) {
    throw new Error('Submissions is not valid array');
  }
  const result = [];
  for (s of submissions) {
    let learner = result.find((l) => s.learner_id === l.id);
    const assignment = ag.assignments.find((a) => a.id == s.assignment_id);
    if (!assignment) {
      throw new Error('Wrong submission data, no matching assignment.');
    }
    if (!learner) {
      learner = {
        id: s.learner_id,
        submissions: [],
      };
      result.push(learner);
    }
    learner.submissions.push({
      ...s.submission,
      assignment,
    });
  }

  return result;
}

/**
 *
 * @param {*} num the number to format
 * @param {*} digits
 * @returns
 */
function toFixedNumber(num, digits = 2) {
  const pow = Math.pow(10, digits);
  return Math.round(num * pow) / pow;
}
