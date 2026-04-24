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
  // Source: ACI-Bench dataset (Hugging Face - mkieffer/ACI-Bench), Encounter ID: D2N087
  {
    label: 'Diabetes',
    condition: 'Type 2 Diabetes',
    contact: {
      patientName: 'Mr Richard Wells',
      patientPhone: '',
      patientEmail: 'jack@sanctuaryhealth.io',
      patientLanguage: 'Spanish',
    },
    transcript: `Doctor: Hi Richard, how are you? The medical assistant told me that you have a tick bite, is that what happened?
Patient: I really don't know where I got it but I do get out in the woods and I do spend a lot of time out in the yard. But yeah, I've got a tick bite around my knee and it's been over a week and it just burns and is quite annoying.
Doctor: OK, and have you had any fever or chills?
Patient: I have not. At this point it just feels warm on that spot.
Doctor: Alright, and have you noticed any other joint pain, like in your elbows or shoulders or anything like that since this started?
Patient: Nothing other than my typical arthritic pain.
Doctor: OK. Now you say that you like to go outside and you're working in the yard. I heard that you were a hunter — when was the last time you went hunting?
Patient: Well I did go hunting not long ago, couple of weeks ago.
Doctor: OK, were you able to shoot anything? Did you bring anything home?
Patient: Well actually yeah, I had some grandchildren with me so I let them have what they wanted.
Doctor: Nice, nice. Anyway, let's get back to our visit here. About your tick bite — do you notice that it's hard for you to move your knee at all?
Patient: Not at this time, no.
Doctor: And do you have any problems walking?
Patient: No.
Doctor: And have you ever had a tick bite before?
Patient: I have, when I was younger I used to get a lot of them because I spent a lot of time out in the woods. But this was just one.
Doctor: And have you ever been diagnosed with what we call Lyme disease before?
Patient: I have not. I wouldn't know what the symptoms are.
Doctor: Yeah, so some of those symptoms — any flu-like symptoms, have you had any body aches or chills or anything like that?
Patient: No, just really kind of a headache. Just generally don't feel well.
Doctor: Generally don't feel well. And has that been since the tick bite?
Patient: It has.
Doctor: OK. And any other symptoms like a cough or shortness of breath or dizziness?
Patient: No.
Doctor: Now since you are here, let me just ask you a little bit about your high blood pressure. Did you buy the blood pressure cuff I asked you to? Have you been checking your blood pressure at home?
Patient: Periodically, yes.
Doctor: OK, and do you think they are running OK?
Patient: Yeah, blood pressure seems to be doing OK. The Lisinopril works well.
Doctor: Good, I was just going to ask if you were taking your Lisinopril. And any side effects from the Lisinopril since we started it? I think we started it about a year or two ago.
Patient: No, no side effects that I'm aware of.
Doctor: OK. And then in terms of your diabetes — are you watching your sugar intake?
Patient: Yeah, I usually watch what I'm eating but...
Doctor: I am a big pie fan as well, I know. What's your favourite type of pie?
Patient: Well, you know, I just like pie. Apple, cherry, chocolate, pecan. I try to avoid the pecan because I think it's just all sugar, but I do like it.
Doctor: I like it too. Alright, are you taking the Metformin twice a day?
Patient: Not every day but most of the time.
Doctor: OK. And are you checking your blood sugars pretty regularly?
Patient: I try to.
Doctor: And do you know on average how they're running? Are they running below one fifty?
Patient: Yeah, it's definitely running below that. With the Metformin it seems to be, you know, one twenty pretty regular.
Doctor: Good, your blood sugars are running in the one twenties. That's really good. OK, well I want to just go ahead and do a quick physical exam. So I'm looking here at your vital signs and they look really good. I do think you're doing a good job with taking your Lisinopril — your blood pressure is about one twenty-two over seventy right now, which is right where we want it. Your heart rate is nice and slow at sixty-seven, which is right where we want it. And I don't appreciate any fever today, you have a normal temperature at ninety-eight point four. So I'm just going to go ahead and call out some physical exam findings. On your heart exam, your heart is in a nice regular rate and rhythm. I don't appreciate any murmur, rub, or gallop. On your lung exam, your lungs are nice and clear to auscultation bilaterally. On your right knee exam, I do appreciate some erythema and oedema as well as an area of fluctuance over your right patella. Does it hurt when I press?
Patient: It's a little bit sore.
Doctor: OK. There is pain to palpation of the right anterior knee. I'm just going to bend your knee up and down — does that hurt at all?
Patient: No, it's just more of the typical grinding that I would feel.
Doctor: OK, there is full range of motion of the right knee. And on skin examination there is evidence of a bull's-eye rash over the right knee. So what does that mean, Richard — you do have some area of inflammation over the right knee where you have that tick bite, and you do have what we call a bull's-eye rash, which is what we get concerned about with Lyme disease. So let's talk about my assessment and plan for you. For your tick bite, my concern is that you might have Lyme disease based on the presentation of your right knee. I'm going to start you on Doxycycline, one hundred milligrams twice a day for about three weeks. I'm also going to send a Lyme titre as well as a Western blot to see if you do in fact have Lyme disease. I'd like to avoid intravenous antibiotics, which I think we can — I want to see how you do with the oral antibiotics first.
Patient: What were those last two tests?
Doctor: So we're going to start you on some antibiotics to help with this possible Lyme disease, and I'm going to order some blood tests just to see exactly what's going on. Sometimes people need intravenous antibiotics because Lyme disease can cause problems on other organs like your heart, if not treated appropriately. But I think we caught this early enough that we can just treat you with oral antibiotics. For your hypertension, I think you're doing a really good job. Let's continue you on the Lisinopril twenty milligrams once a day. I also want to order a lipid panel just to make sure everything is OK with your cholesterol. And then for your diabetes, I want to order a haemoglobin A1c and continue you on the Metformin one thousand milligrams twice a day. It sounds like you're doing a good job since your blood sugars are running in the one twenties. I don't think we need to make any adjustments, but we'll see what the haemoglobin A1c shows — that gives us an idea of what your blood sugars are doing on a long-term basis.
Patient: OK. At what point do you start checking kidney function? I've been told that Metformin can possibly cause some kidney issues.
Doctor: It can, you know. Your kidney function — I checked it about two months ago and it looks pretty good, pretty normal. But since we're doing blood work on you, I can go ahead and order a basic metabolic panel just to make sure your kidney function is stable.
Patient: OK, that'd be good.
Doctor: Anything else?
Patient: Not that I can think of at this time.
Doctor: Well, you know where to find me. Take care. Bye.`,
  },

  // ── Hypertension ─────────────────────────────────────────────
  {
    label: 'Hypertension',
    condition: 'Hypertension',
    contact: {
      patientName: 'Mr Philip Anderson',
      patientPhone: '',
      patientEmail: 'jack@sanctuaryhealth.io',
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
      patientPhone: '',
      patientEmail: 'jack@sanctuaryhealth.io',
      patientLanguage: 'Spanish',
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
