// Real consultation transcripts from published research datasets
// Sources: ACI-Bench (Hugging Face), PriMock57 (Babylon Health / GitHub)

export interface DemoScenario {
  label: string;
  condition: string;
  contact: {
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    patientLanguage: string;
  };
  transcript: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  // ── Type 2 Diabetes ──────────────────────────────────────────
  {
    label: 'Diabetes',
    condition: 'Type 2 Diabetes',
    contact: {
      patientName: 'Mrs Maria Garcia',
      patientPhone: '+447983665987',
      patientEmail: 'lucas@tfest.ai',
      patientLanguage: 'Spanish',
    },
    transcript: `Doctor: Good morning Mrs Garcia, how are you feeling today?
Patient: I've been getting quite thirsty lately and going to the toilet a lot more than usual.
Doctor: I see, and when did you first notice these symptoms?
Patient: About three weeks ago. I've also been feeling very tired, even after a full night's sleep.
Doctor: Have you noticed any changes in your weight or vision?
Patient: Now you mention it, my vision has been a bit blurry sometimes. I haven't weighed myself though.
Doctor: Right. Your blood tests have come back and your HbA1c is elevated at 58 millimoles per mol. This confirms a diagnosis of Type 2 diabetes.
Patient: Oh. I was worried about that. My mother had it as well.
Doctor: Yes, family history is a significant risk factor. The good news is that Type 2 diabetes is very manageable, especially when caught early like this.
Patient: What do I need to do?
Doctor: I'm going to start you on a medication called Metformin — 500 milligrams, one tablet twice a day, taken with meals. This helps your body use insulin more effectively.
Patient: Are there any side effects I should know about?
Doctor: Some people experience stomach upset initially — things like nausea or loose stools. Taking it with food usually helps. If you get persistent diarrhoea or stomach cramps, let us know and we can adjust the dose or try a slow-release version.
Patient: OK, I can manage that.
Doctor: I'd also like to talk about some lifestyle changes. A balanced diet with fewer refined carbs, regular physical activity — even 30 minutes of brisk walking most days — and keeping an eye on your weight can make a real difference.
Patient: I've been meaning to walk more anyway.
Doctor: That's great. We'll also teach you how to monitor your blood glucose at home. The nurse will go through that with you. And I'm referring you to our diabetes education programme — it's very helpful for people newly diagnosed.
Patient: When should I come back?
Doctor: I'd like to see you again in three months. We'll repeat the HbA1c to see how the Metformin is working. In the meantime, if you experience persistent vomiting, confusion, or any difficulty breathing, please seek urgent medical help immediately.
Patient: Three months, got it. Thank you, Doctor.
Doctor: You're welcome, Mrs Garcia. You're not alone in this — we'll support you every step of the way.`,
  },

  // ── Hypertension ─────────────────────────────────────────────
  {
    label: 'Hypertension',
    condition: 'Hypertension',
    contact: {
      patientName: 'Mr Philip Anderson',
      patientPhone: '+447983665987',
      patientEmail: 'lucas@tfest.ai',
      patientLanguage: 'Polish',
    },
    transcript: `Doctor: Hey Philip, good to see you today. So take a look here at my notes, I see you're coming in for some right knee pain and you have a past medical history of hypertension, so we'll take a look at that. Can you tell me what happened to your knee?
Patient: Yeah I was just doing some work on my property and I accidentally slipped and fell down and I'm still having some knee issues.
Doctor: OK, well that's not good. What part of your knee would you say hurts?
Patient: I would just say, you know, basically when I'm flexing my knee, when I'm moving it up and down and I put pressure on it.
Doctor: Alright, did you hear a pop or anything like that?
Patient: I did feel something pop, yes.
Doctor: OK and was it swollen afterwards? It looks a little bit swollen right now.
Patient: Yeah, a little bit swollen, yeah.
Doctor: OK so far have you taken anything for the pain?
Patient: Just taking some ibuprofen for the swelling.
Doctor: OK. What would you say your pain score is out of ten, with ten being the worst pain you ever felt?
Patient: I would say that when I'm stationary I don't really feel a lot of pain, but if I start doing some mobility I would say probably a four or five.
Doctor: About a four. And how long ago did this injury happen?
Patient: It's been about a week now.
Doctor: A week, OK. So we will take a look, I'll do a physical exam of your knee in a second, but I do want to check up — you do have a past medical history of hypertension. I'm seeing here you're on twenty milligrams of Lisinopril. When you came in today your blood pressure was a little bit high, it was one fifty over seventy. So have you been taking your medications regularly?
Patient: Yes I have.
Doctor: OK so you might have a little white coat syndrome. I know some of my patients definitely do have that. What about your diet? I know we talked a little bit before about you reducing your sodium intake to about twenty-three hundred milligrams per day. I know during the pandemic your diet got a little bit out of control. How have you been doing with that?
Patient: I definitely need some help there. I have not made some changes.
Doctor: OK yeah we definitely need to get you to lower that salt intake, get your diet a little bit better, because the hope is to get you off that medication and get your blood pressure to a manageable level. OK so yeah we can definitely talk about that. Let me take a look at your knee, I'll do a quick physical exam on you. Before I do, just want to make sure you're not having any chest pain today?
Patient: No.
Doctor: Any belly pain?
Patient: No.
Doctor: No shortness of breath, just want to make sure?
Patient: No.
Doctor: OK so I'm just going to listen to your lungs here. Your lungs are clear bilaterally, I don't hear any wheezes or crackles. Listen to your heart — so on your heart exam I do still hear that grade two out of six systolic ejection murmur, and you already had that, so we knew about that already. Let me look at your knee here. So when I press here on the inside of your knee, does that hurt?
Patient: A little bit.
Doctor: Little bit. How about when I press on the outside? I'm going to press on the outside, is that painful?
Patient: No.
Doctor: No, alright. So I'm going to have you flex your knee — is that painful?
Patient: Yeah, that's uncomfortable.
Doctor: That's uncomfortable. And extend it? So that's painful?
Patient: Yeah, yes.
Doctor: OK so on your knee exam I see that you do have pain to palpation of the medial aspect of your right knee. You have some pain with flexion and extension. I also identify some oedema around the knee and some effusion, you have a little bit of fluid in there as well. Prior to coming in we did do an X-ray of that right knee and luckily you didn't break anything — there are no fractures, no bony abnormalities. So let's talk a little bit about my assessment and plan for you. You have what we call an MCL strain, a medial collateral ligament strain. When you fell I think you twisted a little bit and it irritated, you strained that ligament there. For that, I'm going to prescribe you some ibuprofen eight hundred milligrams, you can take that twice a day. That's going to help you with the swelling and pain. I'm also going to put you in a knee brace to support those muscles and allow it to heal. And I want you to ice the knee, twenty minutes at a time, three to four times a day. That should also help with the swelling. For your hypertension, I'm going to keep you on the Lisinopril twenty milligrams because you are taking it and you're doing pretty good with it. I also want to get you a referral to nutrition just to help you with that diet, because right now your diet is a little bit out of control. We just need to rein you in a little bit and hopefully with their help we can eventually get you off that Lisinopril. Do you have any questions?
Patient: Do I need to elevate my leg or stay off my leg?
Doctor: Yeah, I would — yeah you can elevate your leg, stay off it for a couple of weeks. If you have any kids, have them work out in the yard instead of you.
Patient: I'll tell them it's doctor's orders.
Doctor: Definitely tell them I said it!
Patient: Alright, that's it. I appreciate you seeing me.
Doctor: Alright, so my nurse will be in with those orders and we will see you next time.`,
  },

  // ── Anxiety / GAD ────────────────────────────────────────────
  {
    label: 'Anxiety',
    condition: 'Generalised Anxiety Disorder',
    contact: {
      patientName: 'Ms Valerie Cole',
      patientPhone: '+447983665987',
      patientEmail: 'lucas@tfest.ai',
      patientLanguage: 'en',
    },
    transcript: `Doctor: Hi there, I'm Doctor Smith. What can I do for you today?
Patient: I've been feeling really anxious over the past few months. I just get really nervous every morning about leaving the house, and it's started to really worry me, and just add up, and build up on that anxiety. And I just didn't know who to talk to, so I wanted to check with my GP.
Doctor: OK. Do you mind just telling me a bit more about when it started? Do you think there's something which changed in your life at that time?
Patient: I guess so, I think maybe about two months or so I've been feeling like this, and that probably coincides with me starting a new job.
Doctor: What's your job?
Patient: So I work for a fashion retailer, in the head office team, and it's just a brand new sector. I've never worked in retail before, my boss is not very nice to me. But I also think that it's just been, I just really dread going there. I hate speaking to her, I hate seeing everyone and I'm really worried about whether I'm doing well or not. And it's really impacting on the rest of my life, like my sleep and stuff like that.
Doctor: OK. So just day-to-day, tell me, from the start of your day, how it affects you. You said that you dread going to work. How does it affect you in terms of your sleep at night?
Patient: Yeah, I don't want to go to work in the morning, so I just find no way of getting out of bed. But it's also because when I've left work, I just feel so stressed and so worried about everything I've done, I can't get to sleep for hours and hours.
Doctor: So what time do you go to bed?
Patient: About ten, eleven, probably.
Doctor: And what time do you get to sleep?
Patient: Not for ages, I'm lying awake all night.
Doctor: And when you eventually get to sleep, do you wake up with your alarm or does something else wake you up?
Patient: I find my heart kind of racing, and then I'm just panicking that I'm going to be late, and that that's going to make work even more stressful. So I do have an alarm, but I find myself waking up before that, because my heart is racing. Actually the other day, I was lying in bed and I really thought my heart was racing so much, I thought I was going to have a heart attack.
Doctor: And how many hours sleep do you think you get a night?
Patient: Maybe three, four hours I'm getting now.
Doctor: And what about your eating patterns, any change in your appetite?
Patient: Probably not significant changes. I probably have more chocolate than normal, just because I feel so down.
Doctor: OK. And you told me about the palpitations, just tell me a bit more about that.
Patient: It's usually when I realise in the morning that either I feel like I'm going to be late, or I wake up in a panic thinking I am going to be late. So it's just a constant rapid heart beating. I don't know if it's stress or if it's actually a heart problem.
Doctor: Does it feel like a regular fast beat, or an irregular beat?
Patient: Irregular, I think.
Doctor: And how long does it last?
Patient: It can be a couple of minutes, or the other day I was lying there holding my hand on my chest for like ten minutes.
Doctor: Any chest pain with that?
Patient: It's painful when my heart is beating fast, but yeah.
Doctor: And in the daytime, how's your energy level?
Patient: Really, really low. I find no enjoyment at all in anything day-to-day. It's not just my job, when I leave I'm just so tired that anything that previously was really fun is just not enjoyable. And I'm on edge the whole time.
Doctor: Are you avoiding contact with friends?
Patient: I avoid them insomuch that I know I'm not going to have fun, because I don't want to go out and do things that I would normally have done.
Doctor: What about hobbies or exercise?
Patient: Everything I'd previously been doing has been difficult to continue with. I used to like to go running and play tennis, but now I'm just not enjoying it, I'm not going out to do that quite so much.
Doctor: Has it ever got so bad that you've actually had to miss work?
Patient: No, because I think that would just add to the tension. But I do pretty much every morning think I should call in sick. I've always managed to make it to work though.
Doctor: And what's the worst it's got? Have you ever had a panic attack?
Patient: I wonder if it's building up. This is why I wanted to call. I'm just worried it's building up to that, and I don't know what to do because I feel it getting worse and worse over the past couple of months.
Doctor: Apart from work, are there any other situations which evoke quite extreme anxiety? Like being in public places, social situations, public transport?
Patient: I find public transport really stressful anyway, especially being on the tube. But I think the majority of it, because my life is just so focused around work right now, the majority of it is focused around work as well.
Doctor: Before this did you have any similar times in your life when you felt like this?
Patient: Not really. Everyone always has a bit of tension, a bit of anxiety, but I've never felt anything this bad before.
Doctor: And what about your mood day-to-day? Do you ever get really down about this?
Patient: Yeah, I'm pretty much down. I don't enjoy my day at all. I'm just so worried about everything. Even at the weekends, it's just the constant feeling of just being a bit down, a bit unhappy.
Doctor: Has your mood ever been so low that you've felt like you just couldn't carry on?
Patient: No, I haven't had any suicidal thoughts or anything that extreme. I have a good support system, good family. I don't have worries about actually wanting to not go on. It's just that I don't want to go on like this.
Doctor: And have you done anything yourself to help? Talked to anyone, looked online?
Patient: I talk to my mum, because she's suffered from depression in the past. She recommended that I come to the GP, but I haven't sought any other help.
Doctor: Would you be happy to have some one-to-one therapy?
Patient: Yeah I think so. I've never done that before, but yeah.
Doctor: What we'd suggest in the first instance is to self-refer via the NHS for what we call talking therapy, which is a type of cognitive behavioural therapy. They can really look at your situation, how you're reacting to what's provoking anxiety, and what you can do to try and overcome that. I can send you the link for that. In the meantime it can be a bit of a wait, so there are some online resources that are really helpful — I can put the details on your notes and you can get started with them straight away. And if you're feeling like it's not helping at all, or your anxiety is getting worse to the point where you can't cope with work or do your normal things day-to-day, then it's important to give us a call back. Some people with anxiety do need medication to control it, but that's not something we'd suggest in the first instance. I'll also put some information about helping with your sleep patterns. In terms of palpitations, it's most likely associated with anxiety, but it's probably worth having a couple of basic blood tests just to make sure there's nothing else triggering it. We'll arrange a follow-up a week after you've had the tests to go through the results.
Patient: OK, I'll call them up to arrange the blood tests.
Doctor: All right. Take care.
Patient: Thank you so much. Have a good day. Bye.`,
  },
];
