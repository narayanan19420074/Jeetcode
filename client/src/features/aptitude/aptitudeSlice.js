// NOTE: I don't have your actual workspaceSlice.js, so the thunk/pending-
// clearing pattern here is inferred from the handoff doc's description of
// its stale-result bug fix ("clearing submitResult on runCode.pending").
// Adjust naming to match your real slice conventions if they differ.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';

export const fetchPatterns = createAsyncThunk('aptitude/fetchPatterns', async (_, { rejectWithValue }) => {
  try {
    const { data } = await aptitudeApi.listPatterns();
    return data.data.items;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const startAttempt = createAsyncThunk(
  'aptitude/startAttempt',
  async ({ slug, mode }, { rejectWithValue }) => {
    try {
      const { data: startData } = await aptitudeApi.startAttempt(slug, mode);
      const { data: qData } = await aptitudeApi.getAttemptQuestions(startData.data.attemptId);
      return { ...startData.data, questions: qData.data.questions };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const checkAnswer = createAsyncThunk(
  'aptitude/checkAnswer',
  async ({ attemptId, questionId, selectedOption }, { rejectWithValue }) => {
    try {
      const { data } = await aptitudeApi.checkAnswer(attemptId, questionId, selectedOption);
      return { questionId, ...data.data };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const submitAttempt = createAsyncThunk(
  'aptitude/submitAttempt',
  async ({ attemptId, answers }, { rejectWithValue }) => {
    try {
      const { data } = await aptitudeApi.submitAttempt(attemptId, answers);
      return data.data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchAttempt = createAsyncThunk(
  'aptitude/fetchAttempt',
  async (attemptId, { rejectWithValue }) => {
    try {
      const { data } = await aptitudeApi.getAttempt(attemptId);
      return data.data; // { result: {...}, expiresAt: ... }
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

const initialState = {
  patterns: [],
  patternsStatus: 'idle',

  attemptId: null,
  mode: null, // 'test' | 'practice'
  expiresAt: null,
  questions: [],
  selectedOptions: {}, // { [questionId]: optionIndex }
  checkResults: {}, // { [questionId]: { isCorrect, correctOptionIndex, explanation } } — practice mode only

  result: null, // { score, correctCount, totalCount, answers } after submit
  status: 'idle', // idle | starting | in-progress | submitting | submitted
  error: null,
};

const aptitudeSlice = createSlice({
  name: 'aptitude',
  initialState,
  reducers: {
    selectOption(state, action) {
      const { questionId, optionIndex } = action.payload;
      state.selectedOptions[questionId] = optionIndex;
    },
    resetAttempt() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatterns.pending, (state) => {
        state.patternsStatus = 'loading';
      })
      .addCase(fetchPatterns.fulfilled, (state, action) => {
        state.patternsStatus = 'succeeded';
        state.patterns = action.payload;
      })
      .addCase(fetchPatterns.rejected, (state, action) => {
        state.patternsStatus = 'failed';
        state.error = action.payload;
      })

      // Starting a new attempt clears any stale result/answers from a
      // previous attempt — same "clear on .pending" fix pattern as the
      // Workspace run/submit stale-result bug.
      .addCase(startAttempt.pending, (state) => {
        state.status = 'starting';
        state.result = null;
        state.selectedOptions = {};
        state.checkResults = {};
        state.error = null;
      })
      .addCase(startAttempt.fulfilled, (state, action) => {
        state.status = 'in-progress';
        state.attemptId = action.payload.attemptId;
        state.mode = action.payload.mode;
        state.expiresAt = action.payload.expiresAt;
        state.questions = action.payload.questions;
      })
      .addCase(startAttempt.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      })

      .addCase(checkAnswer.fulfilled, (state, action) => {
        const { questionId, isCorrect, correctOptionIndex, explanation } = action.payload;
        state.checkResults[questionId] = { isCorrect, correctOptionIndex, explanation };
      })

      .addCase(submitAttempt.pending, (state) => {
        state.status = 'submitting';
      })
      .addCase(submitAttempt.fulfilled, (state, action) => {
        state.status = 'submitted';
        state.result = action.payload;
      })
      .addCase(submitAttempt.rejected, (state, action) => {
        state.status = 'in-progress';
        state.error = action.payload;
      })

      // ... inside extraReducers
    .addCase(fetchAttempt.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(fetchAttempt.fulfilled, (state, action) => {
      state.status = 'submitted'; // treat as submitted since we have the result
      state.result = action.payload.result;
      state.expiresAt = action.payload.expiresAt;
      // We need to set the questions array from the result's answers
      state.questions = action.payload.result.answers.map((a) => a.question);
      state.error = null;
    })
    .addCase(fetchAttempt.rejected, (state, action) => {
      state.status = 'idle';
      state.error = action.payload;
    });
  },
});

export const { selectOption, resetAttempt } = aptitudeSlice.actions;
export default aptitudeSlice.reducer;
