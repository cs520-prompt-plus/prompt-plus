from enum import Enum

########################################
# Section 1 - Pattern and Category Enums
########################################

class Category(Enum):
    INPUT_SEMANTICS = "Input Semantics"
    OUTPUT_CUSTOMIZATION = "Output Customization"
    ERROR_IDENTIFICATION = "Error Identification"
    PROMPT_IMPROVEMENT = "Prompt Improvement"
    INTERACTION = "Interaction"
    CONTEXT_CONTROL = "Context Control"

class Pattern(Enum):
    META_LANGUAGE_CREATION = "Meta Language Creation"
    OUTPUT_AUTOMATER = "Output Automater"
    PERSONA = "Persona"
    VISUALIZATION_GENERATOR = "Visualization Generator"
    RECIPE = "Recipe"
    TEMPLATE = "Template"
    FACT_CHECK_LIST = "Fact Check List"
    REFLECTION = "Reflection"
    QUESTION_REFINEMENT = "Question Refinement"
    ALTERNATIVE_APPROACHES = "Alternative Approaches"
    COGNITIVE_VERIFIER = "Cognitive Verifier"
    REFUSAL_BREAKER = "Refusal Breaker"
    FLIPPED_INTERACTION = "Flipped Interaction"
    GAME_PLAY = "Game Play"
    INFINITE_GENERATION = "Infinite Generation"
    CONTEXT_MANAGER = "Context Manager"

#################################
# Section 2 - Prompts and Context
#################################

TEMPLATE_PROMPT = "Given a prompt, evaluate its {category} based on the {pattern} Pattern. Evaluate the prompt only based on the context for the {pattern} Pattern.\n\nPrompt: \"\"\"{prompt}\"\"\"\n\nContext: \"\"\"{context}\"\"\"\n\nYour Response:"
EVALUATION_PROMPT = "Should changes be made to the prompt? If the pattern is not already applied, consider whether or not it should be applied at all. Start your answer with \"yes\" or \"no\"."
IMPROVEMENT_PROMPT = "Improve the prompt based on the pattern while preserving the original use case of the prompt. Output only the prompt and surround the prompt with <PROMPT></PROMPT> tags."
STANDARDIZATION_PROMPT = "Combine all the prompts below into one prompt while preserving the original use cases of each prompt. Output only the combined prompt and surround the combined prompt with <PROMPT></PROMPT> tags.\n\nPrompts: \n\n{prompts}\n\nYour Response:"

META_LANGUAGE_CREATION_CONTEXT = "1) Intent and Context: During a conversation with an LLM, the user would like to create the prompt via an alternate language, such as a textual short-hand notation for graphs, a description of states and state transitions for a state machine, a set of commands for prompt automation, etc. The intent of this pattern is to explain the semantics of this alternative language to the LLM so the user can write future prompts using this new language and its semantics.\n\n2) Motivation: Many problems, structures, or other ideas communicated in a prompt may be more concisely, unambiguously, or clearly expressed in a language other than English (or whatever conventional human language is used to interact with an LLM). To produce output based on an alternative language, however, an LLM needs to understand the language's semantics.\n\n3) Structure and Key Ideas: Fundamental contextual statements:\n\n| Contextual Statements                        |\n|:---------------------------------------------|\n| When I say X, I mean Y (or would like you to do Y) |\n\nThe key structure of this pattern involves explaining the meaning of one or more symbols, words, or statements to the LLM so it uses the provided semantics for the ensuing conversation. This description can take the form of a simple translation, such as \"X\" means \"Y\". The description can also take more complex forms that define a series of commands and their semantics, such as \"when I say X, I want you to do <action>\". In this case, \"X\" is henceforth bound to the semantics of \"take action\".\n\n4) Example Implementation: The key to successfully using the Meta Language Creation pattern is developing an unambiguous notation or shorthand, such as the following:\n\n\"From now on, whenever I type two identifiers separated by \"->\", I am describing a graph. For example, \"a -> b\" is describing a graph with nodes \"a\" and \"b\" and an edge between them. If I separate identifiers by \"-[w:2, z:3]->\", I am adding properties of the edge, such as a weight or label.\"\n\n5) Consequences: Although this pattern provides a powerful means to customize a user's interaction with an LLM, it may create the potential for confusion within the LLM. As important as it is to clearly define the semantics of the language, it is also essential to ensure the language itself introduces no ambiguities that degrade the LLM's performance or accuracy. For example, the prompt \"whenever I separate two things by commas, it means that the first thing precedes the second thing\" will likely create significant potential for ambiguity and unexpected semantics if punctuation involving commas is used in the prompt."
OUTPUT_AUTOMATER_CONTEXT = ""
PERSONA_CONTEXT = ""
VISUALIZATION_GENERATOR_CONTEXT = ""
RECIPE_CONTEXT = ""
TEMPLATE_CONTEXT = ""
FACT_CHECK_LIST_CONTEXT = ""
REFLECTION_CONTEXT = ""
QUESTION_REFINEMENT_CONTEXT = ""
ALTERNATIVE_APPROACHES_CONTEXT = ""
COGNITIVE_VERIFIER_CONTEXT = ""
REFUSAL_BREAKER_CONTEXT = ""
FLIPPED_INTERACTION_CONTEXT = ""
GAME_PLAY_CONTEXT = ""
INFINITE_GENERATION_CONTEXT = ""
CONTEXT_MANAGER_CONTEXT = ""

###############################
# Section 3 - Mapping Relations
###############################

CATEGORY_TO_PATTERNS = {
    Category.INPUT_SEMANTICS.value: [
        Pattern.META_LANGUAGE_CREATION.value,
    ],
    Category.OUTPUT_CUSTOMIZATION.value: [
        Pattern.OUTPUT_AUTOMATER.value,
        Pattern.PERSONA.value,
        Pattern.VISUALIZATION_GENERATOR.value,
        Pattern.RECIPE.value,
        Pattern.TEMPLATE.value,
    ],
    Category.ERROR_IDENTIFICATION.value: [
        Pattern.FACT_CHECK_LIST.value,
        Pattern.REFLECTION.value,
    ],
    Category.PROMPT_IMPROVEMENT.value: [
        Pattern.QUESTION_REFINEMENT.value,
        Pattern.ALTERNATIVE_APPROACHES.value,
        Pattern.COGNITIVE_VERIFIER.value,
        Pattern.REFUSAL_BREAKER.value,
    ],
    Category.INTERACTION.value: [
        Pattern.FLIPPED_INTERACTION.value,
        Pattern.GAME_PLAY.value,
        Pattern.INFINITE_GENERATION.value,
    ],
    Category.CONTEXT_CONTROL.value: [
        Pattern.CONTEXT_MANAGER.value,
    ]
}

PATTERN_TO_CONTEXT = {
    Pattern.META_LANGUAGE_CREATION.value: META_LANGUAGE_CREATION_CONTEXT,
    Pattern.OUTPUT_AUTOMATER.value: OUTPUT_AUTOMATER_CONTEXT,
    Pattern.PERSONA.value: PERSONA_CONTEXT,
    Pattern.VISUALIZATION_GENERATOR.value: VISUALIZATION_GENERATOR_CONTEXT,
    Pattern.RECIPE.value: RECIPE_CONTEXT,
    Pattern.TEMPLATE.value: TEMPLATE_CONTEXT,
    Pattern.FACT_CHECK_LIST.value: FACT_CHECK_LIST_CONTEXT,
    Pattern.REFLECTION.value: REFLECTION_CONTEXT,
    Pattern.QUESTION_REFINEMENT.value: QUESTION_REFINEMENT_CONTEXT,
    Pattern.ALTERNATIVE_APPROACHES.value: ALTERNATIVE_APPROACHES_CONTEXT,
    Pattern.COGNITIVE_VERIFIER.value: COGNITIVE_VERIFIER_CONTEXT,
    Pattern.REFUSAL_BREAKER.value: REFUSAL_BREAKER_CONTEXT,
    Pattern.FLIPPED_INTERACTION.value: FLIPPED_INTERACTION_CONTEXT,
    Pattern.GAME_PLAY.value: GAME_PLAY_CONTEXT,
    Pattern.INFINITE_GENERATION.value: INFINITE_GENERATION_CONTEXT,
    Pattern.CONTEXT_MANAGER.value: CONTEXT_MANAGER_CONTEXT,
}